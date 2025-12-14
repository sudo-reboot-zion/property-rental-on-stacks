import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBadges } from "@/hooks/use-badge";
import { openContractCall } from "@stacks/connect";
import { releasePayment, cancelBooking, type Booking } from "@/lib/escrow";
import { getTransactionStatus } from "@/lib/stacks-api";
import { CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, Loader2, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";

interface BookingActionsProps {
    booking: Booking & { id: number };
    currentBlockHeight: number;
    onSuccess?: () => void;
}

/**
 * Calculate refund percentage based on blocks until check-in
 */
function calculateRefundPercentage(blocksUntilCheckIn: number): number {
    if (blocksUntilCheckIn >= 1008) return 100;
    if (blocksUntilCheckIn >= 432) return 50;
    return 0;
}

/**
 * Convert blocks to approximate days and hours
 */
function blocksToTime(blocks: number): { days: number; hours: number } {
    const totalMinutes = blocks * 10; // ~10 min per block
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    return { days, hours };
}

export function BookingActions({ booking, currentBlockHeight, onSuccess }: BookingActionsProps) {
    const { userData } = useAuth();
    const { toast } = useToast();
    const { refetchBadges } = useBadges();
    const [isProcessing, setIsProcessing] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    // Poll for transaction status
    useEffect(() => {
        if (!txId) return;

        const pollInterval = setInterval(async () => {
            const status = await getTransactionStatus(txId);
            console.log(`🔄 Polling tx ${txId}: ${status}`);

            if (status === "success") {
                clearInterval(pollInterval);
                setTxId(null);
                setIsCompleted(true); // Immediate UI update
                toast({
                    title: "Transaction Confirmed! 🎉",
                    description: "Your payment has been released and booking completed.",
                });

                // Refresh data
                await refetchBadges();
                onSuccess?.();
            } else if (status === "abort" || status === "failed") {
                clearInterval(pollInterval);
                setTxId(null);
                toast({
                    title: "Transaction Failed",
                    description: "The transaction was aborted or failed.",
                    variant: "destructive",
                });
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(pollInterval);
    }, [txId, toast, refetchBadges, onSuccess]);

    if (!userData) return null;

    const userAddress = userData.profile.stxAddress.testnet;
    const isHost = userAddress === booking.host;
    const isGuest = userAddress === booking.guest;
    const blocksUntilCheckIn = Math.max(0, booking.checkIn - currentBlockHeight);
    const timeUntilCheckIn = blocksToTime(blocksUntilCheckIn);

    // Handle status as both string and object
    const bookingStatus = typeof booking.status === 'string' ? booking.status : (booking.status as any)?.value || 'unknown';

    const canRelease = (isHost || isGuest) && bookingStatus === "confirmed" && currentBlockHeight >= booking.checkIn && booking.escrowedAmount > 0;
    const canCancel = (isHost || isGuest) && bookingStatus === "confirmed" && currentBlockHeight < booking.checkIn && booking.escrowedAmount > 0;
    const refundPercentage = calculateRefundPercentage(blocksUntilCheckIn);
    const refundAmount = (booking.totalAmount / 1_000_000) * (refundPercentage / 100);

    // DEBUG: Log button state
    console.log('✅ Release Button:', canRelease ? 'ENABLED (GREEN)' : 'DISABLED (GRAY)', {
        bookingId: booking.id,
        bookingStatus,
        canRelease
    });

    const handleReleasePayment = async () => {
        setIsProcessing(true);
        try {
            const contractCallOptions = await releasePayment(booking.id);

            await openContractCall({
                ...contractCallOptions,
                onFinish: async (data) => {
                    setTxId(data.txId);
                    toast({
                        title: "Transaction Broadcasted",
                        description: "Payment release is processing on the blockchain. This may take a few minutes.",
                    });

                    // Refresh badges to show newly earned First Booking badge
                    console.log('🎖️ Refreshing badges after payment release...');
                    // Add a small delay to allow indexer to catch up
                    setTimeout(async () => {
                        await refetchBadges();
                    }, 3000);

                    onSuccess?.();
                    setIsProcessing(false);
                },
                onCancel: () => {
                    toast({
                        title: "Transaction Cancelled",
                        description: "Payment release was cancelled",
                        variant: "destructive",
                    });
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            console.error("Error releasing payment:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to release payment",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    const handleCancelBooking = async () => {
        setIsProcessing(true);
        try {
            const contractCallOptions = await cancelBooking(booking.id);

            await openContractCall({
                ...contractCallOptions,
                onFinish: async (data) => {
                    toast({
                        title: "Booking Cancelled",
                        description: `Refund of ${refundAmount.toFixed(2)} STX (${refundPercentage}%) will be processed.`,
                    });
                    onSuccess?.();
                },
                onCancel: () => {
                    toast({
                        title: "Transaction Cancelled",
                        description: "Booking cancellation was cancelled",
                        variant: "destructive",
                    });
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to cancel booking",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full space-y-3">
            {/* Status Section */}
            <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Booking Status</span>
                    {booking.status === "confirmed" && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                            <Clock className="w-3 h-3 mr-1" />
                            Confirmed
                        </Badge>
                    )}
                    {booking.status === "completed" && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                        </Badge>
                    )}
                    {booking.status === "cancelled" && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelled
                        </Badge>
                    )}
                </div>

                {booking.escrowedAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">In Escrow</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {(booking.escrowedAmount / 1_000_000).toFixed(2)} STX
                        </span>
                    </div>
                )}

                {booking.status === "confirmed" && blocksUntilCheckIn > 0 && (
                    <div className="pt-2 border-t border-border/30 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Check-in in</span>
                            <span className="font-medium">
                                {timeUntilCheckIn.days > 0 && `${timeUntilCheckIn.days}d `}
                                {timeUntilCheckIn.hours}h
                                <span className="text-muted-foreground ml-1">
                                    (~{blocksUntilCheckIn} blocks)
                                </span>
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (1 - blocksUntilCheckIn / (booking.checkIn - booking.createdAt)) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons - ALWAYS VISIBLE */}
            <div className="space-y-2">
                {/* Release Payment / Claim Payout Button */}
                {!isCompleted && bookingStatus !== "completed" && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="lg"
                                className={`w-full ${canRelease && !txId ? 'gradient-hero' : 'bg-slate-200 dark:bg-muted hover:bg-slate-300 dark:hover:bg-muted text-slate-700 dark:text-muted-foreground cursor-not-allowed border border-slate-300 dark:border-border'}`}
                                disabled={!canRelease || isProcessing || !!txId}
                            >
                                {txId ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                                        Transaction Pending...
                                    </>
                                ) : isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : canRelease ? (
                                    <>
                                        {isHost ? (
                                            <>
                                                <DollarSign className="w-4 h-4 mr-2" />
                                                Claim Payout
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Release Payment to Host
                                            </>
                                        )}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4 mr-2" />
                                        Waiting for Check-in ({blocksUntilCheckIn} blocks)
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {isHost ? "Claim Payout?" : "Release Payment to Host?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                    <p>
                                        {isHost
                                            ? `This will transfer ${(booking.hostPayout / 1_000_000).toFixed(2)} STX to your wallet.`
                                            : `This will release ${(booking.hostPayout / 1_000_000).toFixed(2)} STX to the host.`
                                        }
                                        {" "}
                                        <strong>{(booking.platformFee / 1_000_000).toFixed(2)} STX</strong> will be paid as platform fee.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        The booking will be marked as completed and {isHost ? "you" : "you may"} earn a badge.
                                    </p>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReleasePayment} disabled={isProcessing} className="gradient-hero">
                                    {isProcessing ? "Processing..." : (isHost ? "Confirm Payout" : "Confirm Release")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Pending Transaction Link */}
                {txId && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        asChild
                    >
                        <a
                            href={`https://explorer.hiro.so/tx/${txId}?chain=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Transaction
                        </a>
                    </Button>
                )}

                {/* Completed State */}
                {(bookingStatus === "completed" || isCompleted) && (
                    <>
                        <Button size="lg" variant="outline" disabled className="w-full bg-emerald-500/10 border-emerald-500/20">
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Payment Released</span>
                        </Button>

                        {/* Leave Review */}
                        <ReviewForm
                            bookingId={booking.id}
                            revieweeAddress={isGuest ? booking.host : booking.guest}
                            onSuccess={onSuccess}
                            trigger={
                                <Button size="lg" variant="secondary" className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Leave a Review
                                </Button>
                            }
                        />
                    </>
                )}

                {/* Cancel Booking - Always visible for confirmed bookings */}
                {booking.status === "confirmed" && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={!canCancel || isProcessing}
                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <XCircle className="w-3 h-3 mr-2" />
                                {canCancel ? `Cancel Booking (${refundPercentage}% refund)` : "Cannot Cancel"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel This Booking?</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-3">
                                    <p>
                                        You will receive a <strong>{refundPercentage}% refund</strong> ({refundAmount.toFixed(2)} STX).
                                    </p>
                                    {refundPercentage < 100 && (
                                        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-semibold text-amber-600">Cancellation Fee</p>
                                                <p className="text-muted-foreground">
                                                    Cancelling {timeUntilCheckIn.days > 0 ? `${timeUntilCheckIn.days} days` : `${timeUntilCheckIn.hours} hours`} before check-in
                                                    results in a {100 - refundPercentage}% fee.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCancelBooking}
                                    disabled={isProcessing}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isProcessing ? "Processing..." : "Confirm Cancellation"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}
