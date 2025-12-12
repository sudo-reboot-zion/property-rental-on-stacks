import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useBadges } from "./use-badge";
import { listProperty } from "@/lib/escrow";
import { useToast } from "./use-toast";
import { openContractCall } from "@stacks/connect";
import {
    uploadMetadataToIPFS,
    uploadImagesToIPFS,
    type PropertyMetadata,
} from "@/lib/ipfs";

export interface ListingFormData {
    title: string;
    description: string;
    pricePerNight: string;
    location: string;
    location_city: string;
    location_country: string;
    locationTag: string;
    images: File[];
    amenities: string[];
    maxGuests: string;
    bedrooms: string;
    bathrooms: string;
}

export function useListing() {
    const { userData } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { refetchBadges } = useBadges();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    /**
     * Create a new property listing
     */
    const createListing = async (formData: ListingFormData) => {
        if (!userData) {
            toast({
                title: "Authentication Required",
                description: "Please connect your wallet to create a listing",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            // Step 1: Upload images to IPFS (0-50%)
            toast({
                title: "Uploading Images",
                description: "Uploading your property images to IPFS...",
            });

            const imageUrls = formData.images.length > 0
                ? await uploadImagesToIPFS(formData.images, (progress) => {
                    setUploadProgress((progress / 100) * 50);
                })
                : [];

            console.log('📸 Image URLs:', imageUrls);

            // Step 2: Get the NEXT property ID from blockchain BEFORE uploading metadata
            setUploadProgress(50);
            toast({
                title: "Checking Blockchain",
                description: "Getting property ID from blockchain...",
            });

            // Fetch current property count (this will be our property_id)
            const propertyCountResponse = await fetch(
                `https://api.testnet.hiro.so/v2/contracts/call-read/${import.meta.env.VITE_CONTRACT_ADDRESS}/${import.meta.env.VITE_CONTRACT_ESCROW}/property-id-nonce`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: import.meta.env.VITE_CONTRACT_ADDRESS,
                        arguments: []
                    })
                }
            );

            let nextPropertyId = 0;
            if (propertyCountResponse.ok) {
                const countData = await propertyCountResponse.json();
                if (countData.okay && countData.result) {
                    // Parse uint from Clarity hex (0x01 + 32 hex chars)
                    const result = countData.result;
                    if (result.startsWith("0x01")) {
                        nextPropertyId = parseInt(result.slice(-16), 16);
                    }
                }
            }

            console.log('📊 Next Property ID:', nextPropertyId);

            // Step 3: Create metadata object WITH property_id and price
            setUploadProgress(55);

            // Convert price to microSTX for consistency
            const priceInMicroSTX = Math.floor(parseFloat(formData.pricePerNight) * 1_000_000);

            const metadata: PropertyMetadata & { property_id: number; price: number; price_per_night: number } = {
                property_id: nextPropertyId, // ✅ CRITICAL: Include blockchain ID
                title: formData.title,
                description: formData.description,
                location: formData.location,
                location_city: formData.location_city,
                location_country: formData.location_country,
                images: imageUrls,
                amenities: formData.amenities,
                maxGuests: parseInt(formData.maxGuests) || 1,
                bedrooms: parseInt(formData.bedrooms) || 1,
                bathrooms: parseInt(formData.bathrooms) || 1,
                price: priceInMicroSTX, // ✅ CRITICAL: Include price in microSTX
                price_per_night: priceInMicroSTX, // ✅ Also as price_per_night for compatibility
            };

            console.log('📋 Metadata to upload:', metadata);

            // Step 4: Upload metadata to IPFS (60-80%)
            toast({
                title: "Creating Metadata",
                description: "Uploading property metadata to IPFS...",
            });

            const metadataHash = await uploadMetadataToIPFS(metadata);

            console.log('✅ Metadata IPFS Hash:', metadataHash);
            setUploadProgress(80);

            // Step 5: Prepare contract call (80-90%)
            toast({
                title: "Preparing Transaction",
                description: "Preparing blockchain transaction...",
            });

            const locationTagNum = parseInt(formData.locationTag) || 0;

            // Get contract call options - send bare hash to blockchain
            const contractCallOptions = await listProperty({
                pricePerNight: priceInMicroSTX,
                locationTag: locationTagNum,
                metadataUri: metadataHash,
            });

            setUploadProgress(90);

            // Step 6: Execute contract call (90-100%)
            toast({
                title: "Confirm Transaction",
                description: "Please confirm the transaction in your wallet",
            });

            await openContractCall({
                ...contractCallOptions,
                onFinish: async (data) => {
                    console.log('✅ Transaction submitted:', data);
                    setUploadProgress(95);

                    try {
                        toast({
                            title: "Transaction Submitted",
                            description: "Waiting for blockchain confirmation...",
                        });

                        console.log('⏳ Waiting for transaction to confirm...');
                        console.log('Transaction ID:', data.txId);

                        // Poll for transaction confirmation
                        const maxAttempts = 30;
                        let attempts = 0;
                        let propertyId: number | null = null;

                        while (attempts < maxAttempts && propertyId === null) {
                            attempts++;
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            try {
                                const txStatusResponse = await fetch(
                                    `https://api.testnet.hiro.so/extended/v1/tx/${data.txId}`
                                );

                                if (txStatusResponse.ok) {
                                    const txStatus = await txStatusResponse.json();
                                    console.log(`Attempt ${attempts}: Transaction status:`, txStatus.tx_status);

                                    if (txStatus.tx_status === 'success') {
                                        const txResult = txStatus.tx_result;

                                        if (txResult && txResult.repr) {
                                            const match = txResult.repr.match(/\(ok u(\d+)\)/);
                                            if (match && match[1]) {
                                                propertyId = parseInt(match[1]);
                                                console.log('✅ Property ID extracted:', propertyId);
                                                break;
                                            }
                                        }
                                    } else if (txStatus.tx_status === 'abort_by_response' ||
                                        txStatus.tx_status === 'abort_by_post_condition') {
                                        throw new Error(`Transaction failed: ${txStatus.tx_status}`);
                                    }
                                }
                            } catch (pollError) {
                                console.warn(`Attempt ${attempts} failed:`, pollError);
                            }
                        }

                        if (propertyId === null) {
                            // Use the nextPropertyId we calculated earlier
                            propertyId = nextPropertyId;
                            console.log('⚠️ Using pre-calculated property ID:', propertyId);
                        }

                        // Sync to backend database (if backend exists)
                        if (import.meta.env.VITE_BACKEND_URL) {
                            toast({
                                title: "Syncing to Database",
                                description: `Saving property #${propertyId} details...`,
                            });

                            const syncPayload = {
                                blockchain_id: propertyId,
                                owner_address: userData.profile.stxAddress.testnet,
                                price_per_night: priceInMicroSTX,
                                location_tag: locationTagNum,
                                metadata_uri: metadataHash,
                                ipfs_hash: metadataHash,
                                active: true
                            };

                            console.log('📤 Syncing to backend:', syncPayload);

                            try {
                                const syncResponse = await fetch(
                                    `${import.meta.env.VITE_BACKEND_URL}/api/properties/sync`,
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(syncPayload),
                                    }
                                );

                                if (syncResponse.ok) {
                                    console.log('✅ Property synced to database');
                                } else {
                                    console.warn('⚠️ Failed to sync to database, but property is on blockchain');
                                }
                            } catch (syncError) {
                                console.warn('⚠️ Database sync failed, but property is on blockchain:', syncError);
                            }
                        }

                        toast({
                            title: "Success!",
                            description: `Property #${propertyId} has been listed successfully! You may have earned a 'First Listing' badge.`,
                        });

                        // Refresh badges to show newly earned First Listing badge
                        // Wait a bit for propagation
                        console.log('⏳ Waiting for node propagation before fetching badges...');
                        setTimeout(async () => {
                            console.log('🎖️ Refreshing badges after successful listing...');
                            await refetchBadges();

                            toast({
                                title: "New Badge Unlocked! 🏆",
                                description: "You've earned the 'Property Pioneer' badge for listing your first property.",
                                className: "bg-primary text-primary-foreground border-none",
                            });
                        }, 3000);

                        // Invalidate property queries to refresh dashboard
                        console.log('🔄 Invalidating property queries...');
                        queryClient.invalidateQueries({ queryKey: ['user-properties'] });
                        queryClient.invalidateQueries({ queryKey: ['host-bookings'] });

                    } catch (confirmError) {
                        console.error('Error during confirmation:', confirmError);
                        toast({
                            title: "Listed on Blockchain",
                            description: confirmError instanceof Error ? confirmError.message : "Property listed on blockchain. Confirmation may take time.",
                        });
                    } finally {
                        setUploadProgress(100);
                        setTimeout(() => {
                            setIsSubmitting(false);
                            setUploadProgress(0);
                        }, 2000);
                    }
                },
                onCancel: () => {
                    toast({
                        title: "Transaction Cancelled",
                        description: "You cancelled the transaction",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    setUploadProgress(0);
                },
            });

        } catch (error) {
            console.error('Error creating listing:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create listing",
                variant: "destructive",
            });
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    /**
     * Validate listing form data
     */
    const validateListing = (formData: ListingFormData): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!formData.title || formData.title.trim().length < 3) {
            errors.push("Title must be at least 3 characters");
        }

        if (!formData.description || formData.description.trim().length < 20) {
            errors.push("Description must be at least 20 characters");
        }

        if (!formData.location || formData.location.trim().length < 3) {
            errors.push("Location is required");
        }

        const price = parseFloat(formData.pricePerNight);
        if (isNaN(price) || price <= 0) {
            errors.push("Price must be greater than 0");
        }

        const locationTag = parseInt(formData.locationTag);
        if (isNaN(locationTag) || locationTag < 0) {
            errors.push("Location tag must be a valid number");
        }

        const maxGuests = parseInt(formData.maxGuests);
        if (isNaN(maxGuests) || maxGuests < 1) {
            errors.push("Maximum guests must be at least 1");
        }

        if (formData.images.length === 0) {
            errors.push("At least one image is required");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    return {
        createListing,
        validateListing,
        isSubmitting,
        uploadProgress,
    };
}