import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Award, MapPin, Calendar, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useReputation } from "@/hooks/use-reputation";
import { WalletAddress } from "@/components/WalletAddress";
import { BadgeCollection } from "@/components/BadgeCollection";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { getUserBookings, getUserProperties } from "@/lib/escrow";

const Profile = () => {
    const { t } = useTranslation();
    const { userData } = useAuth();
    const { stats, formattedRating, reviews, isLoading: reputationLoading } = useReputation();

    // Fetch real user data from blockchain
    const { data: userBookings = [] } = useQuery({
        queryKey: ["user-bookings-count", userData?.profile.stxAddress.testnet],
        enabled: !!userData,
        queryFn: async () => {
            if (!userData) return [];
            return getUserBookings(userData.profile.stxAddress.testnet, 100);
        },
    });

    const { data: userProperties = [] } = useQuery({
        queryKey: ["user-properties-count", userData?.profile.stxAddress.testnet],
        enabled: !!userData,
        queryFn: async () => {
            if (!userData) return [];
            return getUserProperties(userData.profile.stxAddress.testnet, 100);
        },
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24 max-w-5xl animate-fade-in">
                {/* Header Section */}
                <div className="relative mb-12">
                    <div className="h-48 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background border border-border/50 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    </div>

                    <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl bg-muted">
                            <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userData?.profile.stxAddress.mainnet || 'user'}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mb-4 space-y-1">
                            <h1 className="text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
                                User Account
                            </h1>
                            <div className="flex items-center gap-4">
                                <WalletAddress address={userData?.profile.stxAddress.mainnet || ""} className="scale-90 origin-left" />
                            </div>
                        </div>
                    </div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                    {/* Left Column: Stats & Reputation */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    Reputation Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reputationLoading ? (
                                    <div className="flex items-center gap-2 py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">Loading stats...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-bold">{formattedRating.toFixed(1)}</span>
                                            <span className="text-muted-foreground mb-1">/ 5.0</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Based on {stats?.totalReviews || 0} reviews</p>
                                    </>
                                )}

                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Trips Taken (as Guest)</span>
                                        <span className="font-medium">
                                            {userBookings.filter(b => b.guest === userData?.profile.stxAddress.testnet).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Properties Listed</span>
                                        <span className="font-medium">{userProperties.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Bookings (as Host)</span>
                                        <span className="font-medium">
                                            {userBookings.filter(b => b.host === userData?.profile.stxAddress.testnet).length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Reviews */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reputationLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.slice(0, 3).map((review) => (
                                            <div key={review.id} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <WalletAddress address={review.reviewer} className="scale-75 origin-left" />
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.createdAt * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                                            </div>
                                        ))}
                                        {reviews.length > 3 && (
                                            <Button variant="link" className="w-full text-xs h-auto p-0 mt-2">
                                                View all {reviews.length} reviews
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Badges & Achievements */}
                    <div className="lg:col-span-2 space-y-6">
                        {userData?.profile?.stxAddress?.testnet && (
                            <BadgeCollection
                                userAddress={userData.profile.stxAddress.testnet}
                                title="Badges & Milestones"
                                showLocked={true}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Profile;
