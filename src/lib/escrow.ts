import {
    principalCV,
    uintCV,
    stringAsciiCV,
    fetchCallReadOnlyFunction,
    ClarityType,
    cvToValue,
    PostConditionMode,
} from "@stacks/transactions";

import { CONTRACT_ADDRESS, CONTRACTS, NETWORK } from './config';
import { rateLimiter } from './rate-limiter';

// Constants
export const PLATFORM_FEE_BPS = 200; // 2% platform fee
export const BPS_DENOMINATOR = 10000;

// Booking Status Constants
export const BOOKING_STATUS = {
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

// Types
export interface Property {
    owner: string;
    pricePerNight: number;
    locationTag: number;
    metadataUri: string;
    active: boolean;
    createdAt: number;
}

export interface Booking {
    propertyId: number;
    guest: string;
    host: string;
    checkIn: number;
    checkOut: number;
    totalAmount: number;
    platformFee: number;
    hostPayout: number;
    status: string;
    createdAt: number;
    escrowedAmount: number;
}

// ============================================
// PUBLIC FUNCTIONS (Write Operations)
// ============================================

/**
 * List a new property
 */
export async function listProperty({
    pricePerNight,
    locationTag,
    metadataUri,
}: {
    pricePerNight: number;
    locationTag: number;
    metadataUri: string;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.ESCROW,
        functionName: "list-property",
        functionArgs: [
            uintCV(pricePerNight),
            uintCV(locationTag),
            stringAsciiCV(metadataUri),
        ],
    };
}

/**
 * Book a property
 */
export async function bookProperty({
    propertyId,
    checkIn,
    checkOut,
    numNights,
}: {
    propertyId: number;
    checkIn: number;
    checkOut: number;
    numNights: number;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.ESCROW,
        functionName: "book-property",
        functionArgs: [
            uintCV(propertyId),
            uintCV(checkIn),
            uintCV(checkOut),
            uintCV(numNights),
        ],
    };
}

/**
 * Release payment to host after check-in
 */
export async function releasePayment(bookingId: number) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.ESCROW,
        functionName: "release-payment",
        functionArgs: [uintCV(bookingId)],
        postConditionMode: PostConditionMode.Allow,
    };
}

/**
 * Cancel a booking and process refund
 */
export async function cancelBooking(bookingId: number) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.ESCROW,
        functionName: "cancel-booking",
        functionArgs: [uintCV(bookingId)],
        postConditionMode: PostConditionMode.Allow,
    };
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get property details with retry logic for network errors
 */
export async function getProperty(propertyId: number, retries: number = 3): Promise<Property | null> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACTS.ESCROW,
                functionName: "get-property",
                functionArgs: [uintCV(propertyId)],
                senderAddress: CONTRACT_ADDRESS,
                network: NETWORK,
            }));

            if (result.type === ClarityType.OptionalNone) {
                return null;
            }

            if (result.type !== ClarityType.OptionalSome || !result.value) {
                return null;
            }

            const data = cvToValue(result.value);

            // Debug: log the raw data structure
            console.log('🔍 Raw property data from blockchain:', JSON.stringify(data, null, 2));

            // Extract the metadata-uri as a string
            // cvToValue returns objects for complex types, we need to handle strings specially
            let metadataUri = data["metadata-uri"];

            // If it's an object with a 'value' property, extract that
            if (metadataUri && typeof metadataUri === 'object' && 'value' in metadataUri) {
                metadataUri = metadataUri.value;
            }

            // Convert to string if it's a buffer or other type
            if (typeof metadataUri !== 'string') {
                metadataUri = String(metadataUri || '');
            }

            // Extract price-per-night - handle different formats
            // Clarity uint values might come as bigint, string, or wrapped in object
            let pricePerNight = data["price-per-night"];

            // Handle wrapped value
            if (pricePerNight && typeof pricePerNight === 'object' && 'value' in pricePerNight) {
                pricePerNight = pricePerNight.value;
            }

            // Handle bigint (common in Clarity)
            if (typeof pricePerNight === 'bigint') {
                pricePerNight = Number(pricePerNight);
            }

            // Handle string representation
            if (typeof pricePerNight === 'string') {
                pricePerNight = parseInt(pricePerNight, 10);
            }

            const pricePerNightNum = Number(pricePerNight);
            if (isNaN(pricePerNightNum)) {
                console.error('❌ Invalid price-per-night value:', data["price-per-night"], 'Extracted:', pricePerNight, 'Type:', typeof pricePerNight);
                console.error('❌ Full data keys:', Object.keys(data));
            } else {
                console.log(`✅ Property #${propertyId} - Extracted pricePerNight: ${pricePerNightNum} microSTX (${pricePerNightNum / 1_000_000} STX)`);
            }

            // Extract location-tag - handle different formats
            let locationTag = data["location-tag"];
            if (locationTag && typeof locationTag === 'object' && 'value' in locationTag) {
                locationTag = locationTag.value;
            }
            if (typeof locationTag === 'bigint') {
                locationTag = Number(locationTag);
            }
            if (typeof locationTag === 'string') {
                locationTag = parseInt(locationTag, 10);
            }
            const locationTagNum = Number(locationTag);

            // Extract created-at - handle different formats
            let createdAt = data["created-at"];
            if (createdAt && typeof createdAt === 'object' && 'value' in createdAt) {
                createdAt = createdAt.value;
            }
            if (typeof createdAt === 'bigint') {
                createdAt = Number(createdAt);
            }
            if (typeof createdAt === 'string') {
                createdAt = parseInt(createdAt, 10);
            }
            const createdAtNum = Number(createdAt);

            // Extract owner - handle principal type
            let owner = data.owner;
            if (owner && typeof owner === 'object' && 'value' in owner) {
                owner = owner.value;
            }
            if (typeof owner !== 'string') {
                owner = String(owner || '');
            }

            // Extract active - handle boolean
            let active = data.active;
            if (active && typeof active === 'object' && 'value' in active) {
                active = active.value;
            }
            if (typeof active !== 'boolean') {
                active = Boolean(active);
            }

            return {
                owner: owner,
                pricePerNight: pricePerNightNum,
                locationTag: locationTagNum,
                metadataUri: metadataUri,
                active: active,
                createdAt: createdAtNum,
            };
        } catch (error) {
            const isLastAttempt = attempt === retries - 1;

            if (isLastAttempt) {
                console.error(`❌ Error fetching property #${propertyId} after ${retries} attempts:`, error);
                return null;
            }

            console.warn(`⚠️ Error fetching property #${propertyId} (attempt ${attempt + 1}/${retries}), retrying...`);
        }
    }

    return null;
}

/**
 * Helper to parse Clarity numbers that might be BigInt, strings, or wrapped objects
 */
function parseClarityNumber(value: any): number {
    if (value === null || value === undefined) return 0;

    // Handle wrapped value (sometimes happens with certain Stacks versions)
    if (typeof value === 'object' && 'value' in value) {
        value = value.value;
    }

    // Handle bigint
    if (typeof value === 'bigint') {
        return Number(value);
    }

    // Handle string
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Handle number
    if (typeof value === 'number') {
        return value;
    }

    return Number(value) || 0;
}

/**
 * Get booking details
 */
export async function getBooking(bookingId: number): Promise<Booking | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.ESCROW,
            functionName: "get-booking",
            functionArgs: [uintCV(bookingId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        // get-booking returns (response (optional {...}))
        if (result.type !== ClarityType.ResponseOk) {
            return null;
        }

        const optionalValue = result.value;

        if (optionalValue.type === ClarityType.OptionalNone) {
            return null;
        }

        if (optionalValue.type !== ClarityType.OptionalSome || !optionalValue.value) {
            return null;
        }

        const data = cvToValue(optionalValue.value);

        // Parse principal addresses (they come as objects from Clarity)
        let guestAddress = data.guest;
        if (guestAddress && typeof guestAddress === 'object' && 'value' in guestAddress) {
            guestAddress = guestAddress.value;
        }
        if (typeof guestAddress !== 'string') {
            guestAddress = String(guestAddress || '');
        }

        let hostAddress = data.host;
        if (hostAddress && typeof hostAddress === 'object' && 'value' in hostAddress) {
            hostAddress = hostAddress.value;
        }
        if (typeof hostAddress !== 'string') {
            hostAddress = String(hostAddress || '');
        }

        const booking = {
            propertyId: parseClarityNumber(data["property-id"]),
            guest: guestAddress,
            host: hostAddress,
            checkIn: parseClarityNumber(data["check-in"]),
            checkOut: parseClarityNumber(data["check-out"]),
            totalAmount: parseClarityNumber(data["total-amount"]),
            platformFee: parseClarityNumber(data["platform-fee"]),
            hostPayout: parseClarityNumber(data["host-payout"]),
            status: typeof data.status === 'object' && 'value' in data.status ? data.status.value : data.status,
            createdAt: parseClarityNumber(data["created-at"]),
            escrowedAmount: parseClarityNumber(data["escrowed-amount"]),
        };

        console.log(`📋 Parsed booking #${bookingId}:`, {
            propertyId: booking.propertyId,
            totalAmount: booking.totalAmount,
            status: booking.status
        });

        return booking;
    } catch (error) {
        console.error("Error fetching booking:", error);
        return null;
    }
}

/**
 * Check if payment can be released for a booking
 */
export async function canReleasePayment(bookingId: number): Promise<boolean> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.ESCROW,
            functionName: "can-release-payment",
            functionArgs: [uintCV(bookingId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        return result.type === ClarityType.BoolTrue;
    } catch (error) {
        console.error("Error checking if payment can be released:", error);
        return false;
    }
}

/**
 * Get all properties (utility function)
 * Note: This requires tracking property count in the contract or using events
 * For now, we'll implement a basic version that tries to fetch properties sequentially
 * This version continues through gaps in property IDs to find all properties
 */
export async function getAllProperties(maxProperties: number = 200): Promise<(Property & { id: number })[]> {
    try {
        const properties: (Property & { id: number })[] = [];
        let consecutiveNulls = 0;
        const maxConsecutiveNulls = 10; // Stop after 10 consecutive nulls

        // Try to fetch properties up to maxProperties
        // Continue through gaps to find all properties
        // START AT 0 because Clarity property IDs ARE 0-based
        // Fetch in batches to be efficient but not overwhelm the network
        // Even with rate limiter, Promise.all is better than sequential await
        const batchSize = 10;

        for (let i = 0; i < maxProperties; i += batchSize) {
            const batchPromises = [];
            for (let j = 0; j < batchSize && (i + j) < maxProperties; j++) {
                batchPromises.push(getProperty(i + j));
            }

            console.log(`🔍 Fetching property batch ${i} to ${Math.min(i + batchSize, maxProperties) - 1}...`);
            const batchResults = await Promise.all(batchPromises);

            // Process batch results
            for (let j = 0; j < batchResults.length; j++) {
                const property = batchResults[j];
                const propertyId = i + j;

                if (property) {
                    properties.push({
                        id: propertyId,
                        ...property,
                    });
                    consecutiveNulls = 0;
                    console.log(`✅ Found property #${propertyId}`);
                } else {
                    consecutiveNulls++;
                    // console.log(`⚠️ Property #${propertyId} not found`);
                }
            }

            // Check for early exit condition
            if (consecutiveNulls >= maxConsecutiveNulls) {
                console.log(`⏹️ Stopped after ${maxConsecutiveNulls} consecutive nulls`);
                break;
            }
        }

        console.log('✨ Found', properties.length, 'properties');
        return properties;
    } catch (error) {
        console.error("❌ Error fetching all properties:", error);
        return [];
    }
}

/**
 * Get all bookings (utility function)
 * Note: Similar to getAllProperties, this is a basic implementation
 */
export async function getAllBookings(maxBookings: number = 100): Promise<(Booking & { id: number })[]> {
    try {
        const bookings: (Booking & { id: number })[] = [];
        let consecutiveNulls = 0;
        const maxConsecutiveNulls = 20; // Increased to 20 to be safer against gaps

        // Try to fetch bookings up to maxBookings
        // START AT 0 because Clarity booking IDs ARE 0-based
        console.log(`🔍 Fetching bookings (max: ${maxBookings})...`);
        // Fetch in batches
        const batchSize = 10;

        console.log(`🔍 Fetching bookings (max: ${maxBookings})...`);
        for (let i = 0; i < maxBookings; i += batchSize) {
            const batchPromises = [];
            for (let j = 0; j < batchSize && (i + j) < maxBookings; j++) {
                batchPromises.push(getBooking(i + j));
            }

            console.log(`🔍 Fetching booking batch ${i} to ${Math.min(i + batchSize, maxBookings) - 1}...`);
            const batchResults = await Promise.all(batchPromises);

            // Process batch results
            for (let j = 0; j < batchResults.length; j++) {
                const booking = batchResults[j];
                const bookingId = i + j;

                if (booking) {
                    // console.log(`✅ Found booking #${bookingId}`);
                    bookings.push({
                        id: bookingId,
                        ...booking,
                    });
                    consecutiveNulls = 0;
                } else {
                    consecutiveNulls++;
                }
            }

            // Check for early exit condition
            if (consecutiveNulls >= maxConsecutiveNulls) {
                console.log(`⏹️ Stopped at booking ID ${i} after ${maxConsecutiveNulls} consecutive nulls`);
                break;
            }
        }

        console.log('✨ Found', bookings.length, 'bookings');
        return bookings;
    } catch (error) {
        console.error("❌ Error fetching all bookings:", error);
        return [];
    }
}

/**
 * Get bookings for a specific user (as guest or host)
 */
export async function getUserBookings(userAddress: string, maxBookings: number = 100): Promise<(Booking & { id: number })[]> {
    try {
        console.log(`🔍 getUserBookings called for address: "${userAddress}"`);
        const allBookings = await getAllBookings(maxBookings);

        // Filter bookings where user is either guest or host
        const userBookings = allBookings.filter((booking) => {
            const isGuest = booking.guest === userAddress;
            const isHost = booking.host === userAddress;
            const matches = isGuest || isHost;

            console.log(`🔎 Booking #${booking.id}:`, {
                guest: booking.guest,
                host: booking.host,
                userAddress,
                isGuest,
                isHost,
                matches
            });

            return matches;
        });

        console.log('✨ Found', userBookings.length, 'bookings for user', userAddress);
        return userBookings;
    } catch (error) {
        console.error("❌ Error fetching user bookings:", error);
        return [];
    }
}

/**
 * Get properties owned by a specific user
 */
export async function getUserProperties(userAddress: string, maxProperties: number = 100): Promise<(Property & { id: number })[]> {
    try {
        const allProperties = await getAllProperties(maxProperties);

        // Filter properties owned by the user
        const userProperties = allProperties.filter(
            property => property.owner === userAddress
        );

        console.log('✨ Found', userProperties.length, 'properties for user', userAddress);
        return userProperties;
    } catch (error) {
        console.error("❌ Error fetching user properties:", error);
        return [];
    }
}
