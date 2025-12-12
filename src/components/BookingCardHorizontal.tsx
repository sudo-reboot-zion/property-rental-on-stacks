import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Clock } from "lucide-react";
import { BookingActions } from "@/components/BookingActions";
import { DisputeModal } from "@/components/DisputeModal";
import { ReviewDialog } from "@/components/ReviewDialog";
import type { Booking } from "@/lib/escrow";

interface EnrichedBooking extends Booking {
    id: number;
    propertyTitle?: string;
    propertyLocation?: string;
    propertyImage?: string;
}

interface BookingCardHorizontalProps {
    booking: EnrichedBooking;
    userRole: "guest" | "host";
    currentBlockHeight: number;
    onSuccess?: () => void;
}

export function BookingCardHorizontal({
    booking,
    userRole,
    currentBlockHeight,
    onSuccess,
}: BookingCardHorizontalProps) {
    // Calculate progress
    const isConfirmed = booking.status === 'confirmed';
    const isCompleted = booking.status === 'completed';
    const isCancelled = booking.status === 'cancelled';
    
    const hasPassedCheckIn = currentBlockHeight >= booking.checkIn;
    
    let progress = 0;
    if (isCompleted) progress = 100;
    else if (isConfirmed) {
        if (hasPassedCheckIn) progress = 66;
        else progress = 33;
    }

    return (
        <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0">
                    <img
                        src={booking.propertyImage || "/placeholder-property.jpg"}
                        alt={booking.propertyTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
                    
                    <Badge 
                        variant="secondary" 
                        className="absolute top-3 left-3 bg-background/90 backdrop-blur-md shadow-sm border-white/10"
                    >
                        <User className="w-3 h-3 mr-1.5 text-primary" />
                        {userRole === "guest" ? "Guest" : "Host"}
                    </Badge>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between md:justify-start gap-2">
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border/50">
                                    #{booking.id}
                                </Badge>
                                {isCompleted && <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">Completed</Badge>}
                                {isCancelled && <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20">Cancelled</Badge>}
                                {isConfirmed && <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20">Confirmed</Badge>}
                            </div>
                            
                            <h3 className="text-lg font-semibold tracking-tight line-clamp-1">
                                {booking.propertyTitle || `Property #${booking.propertyId}`}
                            </h3>
                            
                            {booking.propertyLocation && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                                    {booking.propertyLocation}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1 text-right">
                            <span className="text-2xl font-bold tracking-tight">
                                {(booking.totalAmount / 1_000_000).toLocaleString()} <span className="text-sm font-medium text-muted-foreground">STX</span>
                            </span>
                            {userRole === "host" && (
                                <span className="text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    Payout: {(booking.hostPayout / 1_000_000).toLocaleString()} STX
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress & Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-4">
                            {/* Mini Progress Bar */}
                            {!isCancelled && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                                        <span className={progress >= 33 ? "text-primary" : ""}>Booked</span>
                                        <span className={progress >= 66 ? "text-primary" : ""}>Check-in</span>
                                        <span className={progress >= 100 ? "text-primary" : ""}>Complete</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Check In</span>
                                    <div className="font-medium flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-primary/70" />
                                        Block {booking.checkIn}
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Check Out</span>
                                    <div className="font-medium flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                        Block {booking.checkOut}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-end gap-2">
                             <BookingActions
                                booking={booking}
                                currentBlockHeight={currentBlockHeight}
                                onSuccess={onSuccess}
                            />
                            
                            {(isConfirmed || isCompleted) && (
                                <DisputeModal
                                    bookingId={booking.id}
                                    onSuccess={onSuccess}
                                />
                            )}

                            {isCompleted && (
                                <ReviewDialog
                                    bookingId={booking.id}
                                    reviewee={userRole === "guest" ? booking.host : booking.guest}
                                    revieweeName={userRole === "guest" ? "Host" : "Guest"}
                                    propertyTitle={booking.propertyTitle}
                                    onSuccess={onSuccess}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
