/**
 * Global Rate Limiter for Stacks API calls
 * Ensures that we don't hit the 429 Too Many Requests limit
 * by serializing requests and enforcing a delay between them.
 */

type RequestTask<T> = () => Promise<T>;

class GlobalRateLimiter {
    private queue: { task: RequestTask<any>; resolve: (value: any) => void; reject: (reason: any) => void }[] = [];
    private activeRequests = 0;
    private maxConcurrent = 5; // Allow 5 concurrent requests
    private lastRequestTime = 0;
    // Reduced delay to 100ms (10 requests/sec max per "thread" effectively)
    private minDelay = 100;

    /**
     * Add a request to the queue
     */
    async add<T>(task: RequestTask<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Process the queue
     */
    private async processQueue() {
        // If we're at max concurrency or queue is empty, do nothing
        if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        // Process as many as we can up to maxConcurrent
        while (this.activeRequests < this.maxConcurrent && this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item) break;

            this.activeRequests++;

            // We don't await the execution here so we can start others
            this.executeTask(item);
        }
    }

    /**
     * Execute a single task with rate limiting logic
     */
    private async executeTask(item: { task: RequestTask<any>; resolve: (value: any) => void; reject: (reason: any) => void }) {
        try {
            // Enforce global delay (simple token bucket-ish approach)
            // We want to space out starts slightly even with concurrency
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            const timeToWait = Math.max(0, this.minDelay - timeSinceLastRequest);

            if (timeToWait > 0) {
                await new Promise(resolve => setTimeout(resolve, timeToWait));
            }

            this.lastRequestTime = Date.now();

            // Execute the task
            const result = await item.task();
            item.resolve(result);
        } catch (error: any) {
            // If we hit a 429, wait longer and retry once
            if (error?.message?.includes('429') || error?.toString().includes('429')) {
                console.warn("⚠️ Hit 429 in rate limiter, waiting 2s before retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    const retryResult = await item.task();
                    item.resolve(retryResult);
                } catch (retryError) {
                    item.reject(retryError);
                }
            } else {
                item.reject(error);
            }
        } finally {
            this.activeRequests--;
            // Trigger next item in queue
            this.processQueue();
        }
    }
}

// Export a singleton instance
export const rateLimiter = new GlobalRateLimiter();
