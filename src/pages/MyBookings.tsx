import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getUserBookings, getProperty } from "@/lib/escrow";
import { fetchIPFSMetadata, getIPFSImageUrl } from "@/lib/ipfs";
import { BookingCardHorizontal } from "@/components/BookingCardHorizontal";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import NoProperties from "@/components/NoProperties";
import { usePendingBookings } from "@/hooks/use-pending-tx";

import { getCurrentBlockHeight } from "@/lib/stacks-api";

const MyBookings = () => {
    const { t } = useTranslation();
    const { userData } = useAuth();
    const [filter, setFilter] = useState<"all" | "confirmed" | "completed" | "cancelled">("all");
    const { pendingBookings, removePendingBooking } = usePendingBookings();

    // Fetch current block height
    const { data: currentBlockHeight = 0 } = useQuery({
        queryKey: ['block-height'],
        queryFn: getCurrentBlockHeight,
        refetchInterval: 10000, // Check every 10 seconds (approx 1 block time)
    });

    const {
        data: bookings = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["my-bookings", userData?.profile.stxAddress.testnet],
        enabled: !!userData,
        refetchOnMount: "always", // Always refetch when component mounts
        queryFn: async () => {
            if (!userData) return [];

            const userAddress = userData.profile.stxAddress.testnet;
            console.log("🔍 Fetching my bookings for user:", userAddress);

            const allBookings = await getUserBookings(userAddress, 100);

            // Filter: Only bookings where user is GUEST
            const myBookings = allBookings.filter(b => b.guest === userAddress);
            console.log(`✅ Found ${myBookings.length} bookings where user is guest`);

            // Enrich bookings with property details and IPFS metadata
            const enrichedBookings = await Promise.all(
                myBookings.map(async (booking) => {
                    try {
                        // Fetch property details
                        const property = await getProperty(booking.propertyId);
                        if (!property) {
                            console.warn(`⚠️ Property #${booking.propertyId} not found`);
                            return null;
                        }

                        // Fetch IPFS metadata
                        const metadata = await fetchIPFSMetadata(property.metadataUri);
                        if (!metadata) {
                            console.warn(`⚠️ Metadata not found for property #${booking.propertyId}`);
                            return null;
                        }

                        // Get cover image
                        const coverImage =
                            metadata?.images?.[0]
                                ? getIPFSImageUrl(metadata.images[0])
                                : undefined;

                        return {
                            ...booking,
                            propertyTitle: metadata.title,
                            propertyLocation: metadata.location,
                            propertyImage: coverImage,
                        };
                    } catch (error) {
                        console.error(`Error enriching booking #${booking.id}:`, error);
                        return null;
                    }
                })
            );

            return enrichedBookings.filter((b) => b !== null);
        },
    });

    // Process pending bookings
    const [enrichedPendingBookings, setEnrichedPendingBookings] = useState<any[]>([]);

    useEffect(() => {
        const enrichPending = async () => {
            if (!userData) return;
            const userAddress = userData.profile.stxAddress.testnet;

            // Filter pending bookings for current user
            const myPending = pendingBookings.filter(b => b.guestAddress === userAddress);

            const enriched = await Promise.all(myPending.map(async (pb) => {
                try {
                    // Check if this booking is already in the confirmed list (deduplication)
                    // Note: We can't match by ID because pending bookings don't have an ID yet
                    // But we can check if there's a confirmed booking with same property and check-in
                    // Or we can just rely on the user removing it manually or a timeout
                    // For now, let's just show it.

                    const property = await getProperty(pb.propertyId);
                    if (!property) return null;

                    const metadata = await fetchIPFSMetadata(property.metadataUri);
                    const coverImage = metadata?.images?.[0] ? getIPFSImageUrl(metadata.images[0]) : undefined;

                    return {
                        id: -1, // Temporary ID
                        ...pb,
                        host: property.owner,
                        guest: userAddress,
                        platformFee: 0, // Unknown
                        hostPayout: 0, // Unknown
                        escrowedAmount: pb.totalAmount,
                        status: 'pending', // Special status
                        propertyTitle: metadata?.title || "Loading...",
                        propertyLocation: metadata?.location || "Loading...",
                        propertyImage: coverImage,
                        isPending: true
                    };
                } catch (e) {
                    return null;
                }
            }));

            setEnrichedPendingBookings(enriched.filter(b => b !== null));
        };

        enrichPending();
    }, [pendingBookings, userData]);


    // Filter bookings - DEDUPLICATE pending bookings
    const deduplicatedPending = enrichedPendingBookings.filter(pending => {
        // Remove pending if a confirmed booking exists for same property and similar check-in
        const hasConfirmed = bookings.some(confirmed =>
            confirmed.propertyId === pending.propertyId &&
            Math.abs(confirmed.checkIn - pending.checkIn) < 10 // Within 10 blocks
        );
        return !hasConfirmed;
    });

    const filteredBookings = [...deduplicatedPending, ...bookings].filter((booking) => {
        if (filter === "all") return true;
        if (booking.isPending && filter === "confirmed") return true;
        return booking.status === filter || booking.status?.value === filter;
    });

    // Count by status
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length + enrichedPendingBookings.length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

    if (!userData) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-24 max-w-5xl">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
                        <p className="text-muted-foreground">Connect your wallet to view your bookings</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24 max-w-5xl animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2 flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                            My Bookings
                        </h1>
                        <p className="text-muted-foreground">View and manage your property bookings</p>
                    </div>
                </div>

                {bookings.length > 0 || enrichedPendingBookings.length > 0 ? (
                    <>
                        {/* Filter Tabs */}
                        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
                            <TabsList>
                                <TabsTrigger value="all">All ({bookings.length + enrichedPendingBookings.length})</TabsTrigger>
                                <TabsTrigger value="confirmed">Confirmed ({confirmedCount})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                                <TabsTrigger value="cancelled">Cancelled ({cancelledCount})</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Bookings List */}
                        <div className="space-y-4">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking, idx) => (
                                    <BookingCardHorizontal
                                        key={booking.id === -1 ? `pending-${idx}` : booking.id}
                                        booking={booking}
                                        userRole="guest"
                                        currentBlockHeight={currentBlockHeight}
                                        onSuccess={() => {
                                            if (booking.isPending) {
                                                removePendingBooking(booking.txId);
                                            }
                                            refetch();
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No {filter} bookings found</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <NoProperties variant="bookings" />
                )}
            </div>
        </div>
    );
};

export default MyBookings;
