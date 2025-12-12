import {
    principalCV,
    uintCV,
    stringUtf8CV,
    fetchCallReadOnlyFunction,
    ClarityType,
    cvToValue,
} from "@stacks/transactions";

import { CONTRACT_ADDRESS, CONTRACTS, NETWORK } from './config';

// Dispute Status Constants
export const DISPUTE_STATUS = {
    PENDING: "pending",
    RESOLVED: "resolved",
    REJECTED: "rejected",
} as const;

// Types
export interface Dispute {
    bookingId: number;
    raisedBy: string;
    reason: string;
    evidence: string;
    status: string;
    resolution: string;
    refundPercentage: number;
    createdAt: number;
    resolvedAt: number;
}

export interface BookingDispute {
    disputeId: number;
    exists: boolean;
}

// ============================================
// PUBLIC FUNCTIONS (Write Operations)
// ============================================

/**
 * Raise a dispute for a booking
 */
export async function raiseDispute({
    bookingId,
    reason,
    evidence,
}: {
    bookingId: number;
    reason: string;
    evidence: string;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.DISPUTE,
        functionName: "raise-dispute",
        functionArgs: [
            uintCV(bookingId),
            stringUtf8CV(reason),
            stringUtf8CV(evidence),
        ],
    };
}

/**
 * Resolve a dispute (admin only)
 */
export async function resolveDispute({
    disputeId,
    resolution,
    refundPercentage,
}: {
    disputeId: number;
    resolution: string;
    refundPercentage: number;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.DISPUTE,
        functionName: "resolve-dispute",
        functionArgs: [
            uintCV(disputeId),
            stringUtf8CV(resolution),
            uintCV(refundPercentage),
        ],
    };
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get dispute details by dispute ID
 */
export async function getDispute(disputeId: number): Promise<Dispute | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "get-dispute",
            functionArgs: [uintCV(disputeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);

        return {
            bookingId: Number(data["booking-id"]),
            raisedBy: data["raised-by"],
            reason: data.reason,
            evidence: data.evidence,
            status: data.status,
            resolution: data.resolution,
            refundPercentage: Number(data["refund-percentage"]),
            createdAt: Number(data["created-at"]),
            resolvedAt: Number(data["resolved-at"]),
        };
    } catch (error) {
        console.error("Error fetching dispute:", error);
        return null;
    }
}

/**
 * Get dispute for a specific booking
 */
export async function getBookingDispute(bookingId: number): Promise<BookingDispute | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "get-booking-dispute",
            functionArgs: [uintCV(bookingId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);

        return {
            disputeId: Number(data["dispute-id"]),
            exists: data.exists,
        };
    } catch (error) {
        console.error("Error fetching booking dispute:", error);
        return null;
    }
}

/**
 * Check if a dispute is resolved
 */
export async function isDisputeResolved(disputeId: number): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "is-dispute-resolved",
            functionArgs: [uintCV(disputeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        return result.type === ClarityType.BoolTrue;
    } catch (error) {
        console.error("Error checking if dispute is resolved:", error);
        return false;
    }
}

/**
 * Get dispute status
 */
export async function getDisputeStatus(disputeId: number): Promise<string | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "get-dispute-status",
            functionArgs: [uintCV(disputeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type !== ClarityType.ResponseOk) {
            return null;
        }

        const status = cvToValue(result.value);
        return status as string;
    } catch (error) {
        console.error("Error fetching dispute status:", error);
        return null;
    }
}

/**
 * Get total number of disputes
 */
export async function getDisputeCount(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "get-dispute-count",
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type !== ClarityType.ResponseOk) {
            return 0;
        }

        const count = cvToValue(result.value);
        return Number(count);
    } catch (error) {
        console.error("Error fetching dispute count:", error);
        return 0;
    }
}

/**
 * Get all disputes
 */
export async function getAllDisputes(): Promise<(Dispute & { id: number })[]> {
    try {
        const disputeCount = await getDisputeCount();

        console.log('📊 Total disputes from contract:', disputeCount);

        if (disputeCount === 0) {
            console.log('⚠️ No disputes found');
            return [];
        }

        const disputes: (Dispute & { id: number })[] = [];

        for (let i = 0; i < disputeCount; i++) {
            console.log(`🔍 Fetching dispute ${i}...`);
            const dispute = await getDispute(i);

            if (dispute) {
                console.log(`✅ Dispute ${i} fetched`);
                disputes.push({
                    id: i,
                    ...dispute,
                });
            } else {
                console.warn(`⚠️ Dispute ${i} returned null`);
            }
        }

        console.log('✨ Final disputes array:', disputes.length, 'disputes');
        return disputes;
    } catch (error) {
        console.error("❌ Error fetching all disputes:", error);
        return [];
    }
}
/**
 * Get contract owner
 */
export async function getContractOwner(): Promise<string | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.DISPUTE,
            functionName: "get-contract-owner",
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type !== ClarityType.ResponseOk) {
            return null;
        }

        return cvToValue(result.value);
    } catch (error) {
        console.error("Error fetching contract owner:", error);
        return null;
    }
}
