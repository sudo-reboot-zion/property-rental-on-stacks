import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getUserProperties } from "@/lib/escrow";
import { fetchIPFSMetadata, getIPFSImageUrl } from "@/lib/ipfs";

export interface EnrichedProperty {
    id: number;
    blockchain_id: number;
    title: string;
    description: string;
    location_city: string;
    location_country: string;
    price_per_night: number;
    max_guests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    cover_image: string | undefined;
    images: string[];
    active: boolean;
    owner: string;
}

export function useHostProperties() {
    const { userData } = useAuth();

    return useQuery({
        queryKey: ['user-properties', userData?.profile?.stxAddress?.testnet],
        enabled: !!userData?.profile?.stxAddress?.testnet,
        queryFn: async () => {
            if (!userData?.profile?.stxAddress?.testnet) {
                return [];
            }

            console.log('🔍 Fetching properties for user:', userData.profile.stxAddress.testnet);

            // Fetch properties owned by this user
            const blockchainProperties = await getUserProperties(
                userData.profile.stxAddress.testnet,
                50
            );

            console.log(`✅ Found ${blockchainProperties.length} properties for user`);

            // Enrich each property with IPFS metadata
            const enrichedProperties: (EnrichedProperty | null)[] = await Promise.all(
                blockchainProperties.map(async (prop) => {
                    try {
                        const metadata = await fetchIPFSMetadata(prop.metadataUri);

                        if (!metadata) {
                            console.warn(`⚠️ Could not fetch metadata for property #${prop.id}`);
                            return null;
                        }

                        // Get the first image URL
                        const imageUrl = metadata?.images?.[0]
                            ? getIPFSImageUrl(metadata.images[0])
                            : undefined;

                        return {
                            id: prop.id,
                            blockchain_id: prop.id,
                            title: metadata.title,
                            description: metadata.description,
                            location_city: metadata.location.split(',')[0]?.trim() || metadata.location,
                            location_country: metadata.location.split(',')[1]?.trim() || '',
                            price_per_night: Number(prop.pricePerNight),
                            max_guests: metadata.maxGuests,
                            bedrooms: metadata.bedrooms,
                            bathrooms: metadata.bathrooms,
                            amenities: metadata.amenities,
                            cover_image: imageUrl,
                            images: metadata.images.map(getIPFSImageUrl),
                            active: prop.active,
                            owner: prop.owner,
                        };
                    } catch (error) {
                        console.error(`Error enriching property #${prop.id}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null values (failed metadata fetches)
            const validProperties = enrichedProperties.filter((prop): prop is EnrichedProperty => prop !== null);
            console.log(`✅ Successfully enriched ${validProperties.length} properties with IPFS data`);

            return validProperties;
        }
    });
}
