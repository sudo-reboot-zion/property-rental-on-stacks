import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Home, Users, TrendingUp, Loader2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getUserProperties, getUserBookings, getProperty } from "@/lib/escrow";
import { fetchIPFSMetadata, getIPFSImageUrl } from "@/lib/ipfs";
import { useHostProperties } from "@/hooks/use-host-properties";
import { BookingActions } from "@/components/BookingActions";
import NoProperties from "@/components/NoProperties";
import PropertyCard from "@/components/PropertyCard";
import Loader from "@/components/Loader";
import { BadgeCollection } from "@/components/BadgeCollection";
import { getCurrentBlockHeight } from "@/lib/stacks-api";



const Dashboard = () => {
    const { t } = useTranslation();
    const { userData } = useAuth();

    // Fetch current block height
    const { data: currentBlockHeight = 0 } = useQuery({
        queryKey: ['block-height'],
        queryFn: getCurrentBlockHeight,
        refetchInterval: 60000, // Refresh every minute
    });

    // Fetch user's properties from blockchain
    const { data: userProperties = [], isLoading: isLoadingProperties } = useHostProperties();

    // Fetch user's bookings (as host)
    const { data: hostBookings = [], isLoading: isLoadingBookings, refetch: refetchBookings } = useQuery({
        queryKey: ['host-bookings', userData?.profile?.stxAddress?.testnet],
        enabled: !!userData?.profile?.stxAddress?.testnet,
        queryFn: async () => {
            if (!userData?.profile?.stxAddress?.testnet) {
                return [];
            }

            const userAddress = userData.profile.stxAddress.testnet;
            const allBookings = await getUserBookings(userAddress, 100);

            // Filter to only bookings where user is the host
            const hostOnlyBookings = allBookings.filter(booking => booking.host === userAddress);

            // Enrich bookings with property details in parallel
            const enrichedBookings = await Promise.all(hostOnlyBookings.map(async (booking) => {
                try {
                    const property = await getProperty(booking.propertyId);
                    if (!property) {
                        return booking;
                    }

                    const metadata = await fetchIPFSMetadata(property.metadataUri);
                    if (!metadata) {
                        return booking;
                    }

                    return {
                        ...booking,
                        propertyTitle: metadata.title,
                        propertyLocation: metadata.location,
                    };
                } catch (error) {
                    console.error(`Error enriching booking #${booking.id}:`, error);
                    return booking;
                }
            }));

            return enrichedBookings;
        }
    });

    const isLoading = isLoadingProperties || isLoadingBookings;
    const hasListings = userProperties.length > 0;

    // Calculate revenue from completed bookings
    const totalRevenue = hostBookings
        .filter(b => b.status === "completed")
        .reduce((sum, b) => sum + b.hostPayout, 0) / 1_000_000;

    const confirmedBookings = hostBookings.filter(b => b.status === "confirmed").length;
    const completedBookings = hostBookings.filter(b => b.status === "completed").length;

    // Calculate stats from user's properties
    const stats = hasListings ? [
        {
            title: "Total Listings",
            value: userProperties.length,
            change: `${userProperties.filter((p: any) => p.active).length} active`,
            icon: Home,
        },
        {
            title: "Total Revenue",
            value: `${totalRevenue.toFixed(2)} STX`,
            change: `${completedBookings} completed bookings`,
            icon: DollarSign,
        },
        {
            title: "Active Bookings",
            value: confirmedBookings,
            change: `${completedBookings} completed`,
            icon: Calendar,
        },
        {
            title: "Total Capacity",
            value: userProperties.reduce((sum: number, p: any) => sum + (p.max_guests || 0), 0),
            change: "guests across all listings",
            icon: Users,
        },
    ] : [];

    // Get recent bookings (last 5)
    const recentBookings = hostBookings.slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Manage your listings and track your earnings.</p>
                </div>
                <Link to="/host/create-listing">
                    <Button className="gradient-hero shadow-elegant hover:shadow-glow transition-smooth">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Listing
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : !hasListings ? (
                <NoProperties variant="host" />
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat: any, index) => (
                            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-smooth">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* User's Properties List */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Your Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userProperties.map((property: any) => (
                                    <PropertyCard
                                        key={property.id}
                                        id={property.blockchain_id}
                                        title={property.title || "Untitled Property"}
                                        location={`${property.location_city || ""}, ${property.location_country || ""}`}
                                        price={property.price_per_night}
                                        guests={property.max_guests || 2}
                                        imageUrl={property.cover_image}
                                        featured={false}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity / Bookings */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Recent Bookings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentBookings.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No bookings yet</p>
                                            <p className="text-xs mt-2">Bookings will appear here once guests book your properties</p>
                                        </div>
                                    ) : (
                                        recentBookings.map((booking: any) => (
                                            <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium">Booking #{booking.id}</p>
                                                        {booking.status === 'confirmed' && (
                                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-xs border-blue-200">
                                                                Payout Pending
                                                            </Badge>
                                                        )}
                                                        {booking.status === 'completed' && (
                                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-xs border-emerald-200">
                                                                Paid Out
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.propertyTitle ? (
                                                            <>{booking.propertyTitle} • Guest: {booking.guest.slice(0, 8)}...</>
                                                        ) : (
                                                            <>Property #{booking.propertyId} • Guest: {booking.guest.slice(0, 8)}...</>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Amount: {(booking.totalAmount / 1_000_000).toFixed(2)} STX
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    <BookingActions
                                                        booking={booking}
                                                        currentBlockHeight={currentBlockHeight}
                                                        onSuccess={() => refetchBookings()}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Host Achievements */}
                        {userData?.profile?.stxAddress?.testnet && (
                            <Card className="col-span-1 lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="pt-6">
                                    <BadgeCollection
                                        userAddress={userData.profile.stxAddress.testnet}
                                        title="Your Achievements"
                                        showLocked={true}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                        <div>
                                            <p className="text-sm font-medium">List your first property</p>
                                            <p className="text-xs text-muted-foreground">Start earning by creating your first listing.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-accent" />
                                        <div>
                                            <p className="text-sm font-medium">Blockchain verified</p>
                                            <p className="text-xs text-muted-foreground">All transactions are secured on-chain.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;

