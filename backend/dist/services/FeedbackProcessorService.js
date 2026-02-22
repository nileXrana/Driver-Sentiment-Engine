"use strict";
/**
 * FeedbackProcessorService.ts
 * ----------------------------
 * The Queue Worker — orchestrates the entire feedback pipeline.
 *
 * Flow:
 *   1. API receives feedback → enqueues it (non-blocking, fast response)
 *   2. This worker polls the queue on an interval
 *   3. For each item: save to DB → update driver score → check alerts
 *
 * This decouples the "accept feedback" step from the "process feedback" step.
 * The user gets an instant response, and heavy processing happens async.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackProcessorService = void 0;
class FeedbackProcessorService {
    constructor(feedbackQueue, sentimentEngine, driverService, alertService, feedbackRepository) {
        /** Handle for the polling interval (so we can stop it on shutdown) */
        this.workerInterval = null;
        /** Track how many items we've processed (useful for monitoring) */
        this.processedCount = 0;
        this.feedbackQueue = feedbackQueue;
        this.sentimentEngine = sentimentEngine;
        this.driverService = driverService;
        this.alertService = alertService;
        this.feedbackRepository = feedbackRepository;
    }
    /**
     * Submit a new feedback item.
     *
     * This is called by the controller. It:
     *   1. Runs sentiment analysis (fast, in-memory, no I/O)
     *   2. Ensures the driver exists in the database
     *   3. Enqueues the item for async processing
     *   4. Returns immediately with the sentiment result
     */
    async submitFeedback(request) {
        // Step 1: Analyze sentiment right away (synchronous, O(n) on text length)
        // Pass the explicit user rating as the second parameter to blend it
        const sentimentResult = this.sentimentEngine.analyze(request.feedbackText, request.rating);
        // Step 2: Ensure the driver record exists (create if first-time)
        await this.driverService.findOrCreateDriver(request.driverId, request.driverName);
        // Step 3: Enqueue for background processing (saves to DB, updates score)
        const queuePosition = this.feedbackQueue.enqueue({
            request,
            sentimentResult,
            enqueuedAt: new Date(),
        });
        console.log(`[FeedbackProcessor] Feedback for driver '${request.driverId}' enqueued ` +
            `at position ${queuePosition}. Sentiment: ${sentimentResult.label} (${sentimentResult.score})`);
        return { sentimentResult, queuePosition };
    }
    /**
     * Start the background worker that polls the queue.
     * Uses setInterval for simplicity — in production, we'd use a proper
     * job scheduler or a message broker consumer.
     */
    startWorker(pollIntervalMs = 2000) {
        console.log(`[FeedbackProcessor] Starting queue worker (polling every ${pollIntervalMs}ms)...`);
        this.workerInterval = setInterval(async () => {
            await this.processNextItem();
        }, pollIntervalMs);
    }
    /** Stop the worker (for graceful shutdown) */
    stopWorker() {
        if (this.workerInterval) {
            clearInterval(this.workerInterval);
            this.workerInterval = null;
            console.log(`[FeedbackProcessor] Worker stopped. Processed ${this.processedCount} items total.`);
        }
    }
    /**
     * Process one item from the queue.
     *
     * Why process one at a time instead of draining the whole queue?
     * - Prevents long-running loops that block the event loop
     * - Each item gets its own error boundary (one failure doesn't kill the batch)
     * - Easier to reason about and debug
     */
    async processNextItem() {
        // Guard: Don't attempt to dequeue from an empty queue
        if (this.feedbackQueue.isEmpty()) {
            return; // Nothing to process — this is completely normal
        }
        const item = this.feedbackQueue.dequeue();
        if (!item) {
            return; // Double-check safety (defensive programming)
        }
        try {
            const { request, sentimentResult } = item;
            // Step 1: Save feedback to the database
            const savedFeedback = await this.feedbackRepository.create({
                driverId: request.driverId,
                feedbackText: request.feedbackText,
                userName: request.userName,
                feedbackDate: request.feedbackDate,
                sentimentScore: sentimentResult.score,
                sentimentLabel: sentimentResult.label,
                matchedWords: sentimentResult.matchedWords,
                processed: false,
            });
            // Step 2: Update the driver's rolling average score
            const updatedDriver = await this.driverService.updateDriverScore(request.driverId, sentimentResult.score);
            // Step 3: Check if this score drop should trigger an alert
            await this.alertService.checkAndAlert(request.driverId, updatedDriver.averageScore);
            // Step 4: Mark feedback as fully processed
            await this.feedbackRepository.markAsProcessed(String(savedFeedback._id));
            this.processedCount++;
            console.log(`[FeedbackProcessor] ✓ Processed feedback for driver '${request.driverId}'. ` +
                `Total processed: ${this.processedCount}`);
        }
        catch (error) {
            // Log the error but don't crash the worker — it should keep running
            console.error("[FeedbackProcessor] Error processing queue item:", error);
        }
    }
}
exports.FeedbackProcessorService = FeedbackProcessorService;
//# sourceMappingURL=FeedbackProcessorService.js.map