import { NETWORK } from "./config";

/**
 * Fetch the current Stacks block height from the network API
 */
interface NetworkWithApi {
    coreApiUrl: string;
}

export async function getCurrentBlockHeight(): Promise<number> {
    try {
        const response = await fetch('https://api.testnet.hiro.so/v2/info');
        if (!response.ok) {
            throw new Error(`Failed to fetch network info: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ Current block height:', data.stacks_tip_height);
        return data.stacks_tip_height;
    } catch (error) {
        console.error("Error fetching block height:", error);
        // Fallback - use a very high number so buttons aren't blocked
        console.warn('⚠️ Using fallback block height: 3690000');
        return 3690000; // Updated fallback to current approximate height
    }
}


import { rateLimiter } from './rate-limiter';

export async function getTransactionStatus(txId: string): Promise<string> {
    try {
        const response = await rateLimiter.add(() => fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txId}`));
        if (!response.ok) {
            throw new Error(`Failed to fetch tx info: ${response.statusText}`);
        }
        const data = await response.json();
        return data.tx_status; // "pending", "success", "abort", etc.
    } catch (error) {
        console.error("Error fetching tx status:", error);
        return "pending"; // Assume pending on error to keep polling
    }
}
