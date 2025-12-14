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
const EVENT_KEY = 'stackstay_pending_bookings_updated';

export function usePendingBookings() {
    // Initialize state from local storage
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to parse pending bookings", e);
            return [];
        }
    });

    // Listen for storage events (cross-tab) and custom events (same-tab)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    setPendingBookings(JSON.parse(e.newValue));
                } catch (err) {
                    console.error("Error parsing storage event data", err);
                }
            }
        };

        const handleCustomEvent = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setPendingBookings(JSON.parse(stored));
                } catch (err) {
                    console.error("Error parsing custom event data", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(EVENT_KEY, handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(EVENT_KEY, handleCustomEvent);
        };
    }, []);

    const dispatchUpdate = (newBookings: PendingBooking[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
        setPendingBookings(newBookings);
        // Dispatch custom event to notify other components in the same tab
        window.dispatchEvent(new Event(EVENT_KEY));
    };

    const addPendingBooking = (booking: PendingBooking) => {
        const current = [...pendingBookings];
        // Avoid duplicates
        if (current.some(b => b.txId === booking.txId)) return;
        
        const updated = [...current, booking];
        dispatchUpdate(updated);
    };

    const removePendingBooking = (txId: string) => {
        const updated = pendingBookings.filter(b => b.txId !== txId);
        dispatchUpdate(updated);
    };

    const clearPendingBookings = () => {
        dispatchUpdate([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        pendingBookings,
        addPendingBooking,
        removePendingBooking,
        clearPendingBookings
    };
}
