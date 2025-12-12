import { useState, useEffect } from 'react';

export interface PendingBooking {
    txId: string;
    propertyId: number;
    checkIn: number;
    checkOut: number;
    guestAddress: string;
    totalAmount: number;
    createdAt: number;
    status: 'pending';
}

const STORAGE_KEY = 'stackstay_pending_bookings';

export function usePendingBookings() {
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setPendingBookings(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse pending bookings", e);
            }
        }
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingBookings));
    }, [pendingBookings]);

    const addPendingBooking = (booking: PendingBooking) => {
        setPendingBookings(prev => {
            // Avoid duplicates
            if (prev.some(b => b.txId === booking.txId)) return prev;
            return [...prev, booking];
        });
    };

    const removePendingBooking = (txId: string) => {
        setPendingBookings(prev => prev.filter(b => b.txId !== txId));
    };

    const clearPendingBookings = () => {
        setPendingBookings([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        pendingBookings,
        addPendingBooking,
        removePendingBooking,
        clearPendingBookings
    };
}
