import { useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { openContractCall } from "@stacks/connect";
import {
    getDispute,
    getBookingDispute,
    raiseDispute as raiseDisputeTx,
    resolveDispute as resolveDisputeTx,
    isDisputeResolved,
    getDisputeStatus,
    type Dispute,
    type BookingDispute,
} from "@/lib/dispute";

export interface DisputeData {
    dispute: Dispute | null;
    bookingDispute: BookingDispute | null;
    status: string | null;
    isResolved: boolean;
}

export function useDispute(bookingId?: number) {
    const { userData } = useAuth();
    const { toast } = useToast();

    const [disputeData, setDisputeData] = useState<DisputeData>({
        dispute: null,
        bookingDispute: null,
        status: null,
        isResolved: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch dispute data for a booking
     */
    const fetchDisputeData = useCallback(async () => {
        if (bookingId === undefined) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log(`⚖️ Fetching dispute data for booking ${bookingId}...`);

            // First check if booking has a dispute
            const bookingDispute = await getBookingDispute(bookingId);

            if (!bookingDispute || !bookingDispute.exists) {
                setDisputeData({
                    dispute: null,
                    bookingDispute: null,
                    status: null,
                    isResolved: false,
                });
                return;
            }

            // If dispute exists, fetch details
            const [dispute, status, isResolved] = await Promise.all([
                getDispute(bookingDispute.disputeId),
                getDisputeStatus(bookingDispute.disputeId),
                isDisputeResolved(bookingDispute.disputeId)
            ]);

            setDisputeData({
                dispute,
                bookingDispute,
                status,
                isResolved,
            });

            console.log(`✅ Loaded dispute ${bookingDispute.disputeId} for booking ${bookingId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch dispute data";
            setError(errorMessage);
            console.error("Error fetching dispute:", err);
        } finally {
            setIsLoading(false);
        }
    }, [bookingId]);

    /**
     * Raise a new dispute
     */
    const raiseDispute = async (
        reason: string,
        evidence: string
    ) => {
        if (!userData || bookingId === undefined) {
            toast({
                title: "Error",
                description: "Cannot raise dispute: Missing user or booking ID",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const txOptions = await raiseDisputeTx({
                bookingId,
                reason,
                evidence,
            });

            await openContractCall({
                ...txOptions,
                onFinish: (data) => {
                    console.log("✅ Dispute transaction submitted:", data);
                    toast({
                        title: "Dispute Raised",
                        description: "Your dispute has been submitted to the blockchain!",
                    });
                    setIsSubmitting(false);
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (err) {
            console.error("Error raising dispute:", err);
            toast({
                title: "Error",
                description: "Failed to raise dispute",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    /**
     * Resolve a dispute (Admin only)
     */
    const resolveDispute = async (
        disputeId: number,
        resolution: string,
        refundPercentage: number
    ) => {
        if (!userData) return;

        setIsSubmitting(true);

        try {
            const txOptions = await resolveDisputeTx({
                disputeId,
                resolution,
                refundPercentage,
            });

            await openContractCall({
                ...txOptions,
                onFinish: (data) => {
                    console.log("✅ Dispute resolution submitted:", data);
                    toast({
                        title: "Dispute Resolved",
                        description: "Resolution has been submitted to the blockchain!",
                    });
                    setIsSubmitting(false);
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (err) {
            console.error("Error resolving dispute:", err);
            toast({
                title: "Error",
                description: "Failed to resolve dispute",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    return {
        ...disputeData,
        isLoading,
        isSubmitting,
        error,
        fetchDisputeData,
        raiseDispute,
        resolveDispute,
    };
}
