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
import { InMemoryQueue } from "./InMemoryQueue";
import { SentimentAnalysisService } from "./SentimentAnalysisService";
import { DriverService } from "./DriverService";
import { AlertService } from "./AlertService";
import { FeedbackRepository } from "../repositories/FeedbackRepository";
import { SubmitFeedbackRequest } from "../types/request.types";
import { SentimentResult } from "../interfaces";
/** Shape of items sitting in the queue waiting to be processed */
interface QueuedFeedbackItem {
    request: SubmitFeedbackRequest;
    sentimentResult: SentimentResult;
    enqueuedAt: Date;
}
export declare class FeedbackProcessorService {
    private readonly feedbackQueue;
    private readonly sentimentEngine;
    private readonly driverService;
    private readonly alertService;
    private readonly feedbackRepository;
    /** Handle for the polling interval (so we can stop it on shutdown) */
    private workerInterval;
    /** Track how many items we've processed (useful for monitoring) */
    private processedCount;
    constructor(feedbackQueue: InMemoryQueue<QueuedFeedbackItem>, sentimentEngine: SentimentAnalysisService, driverService: DriverService, alertService: AlertService, feedbackRepository: FeedbackRepository);
    /**
     * Submit a new feedback item.
     *
     * This is called by the controller. It:
     *   1. Runs sentiment analysis (fast, in-memory, no I/O)
     *   2. Ensures the driver exists in the database
     *   3. Enqueues the item for async processing
     *   4. Returns immediately with the sentiment result
     */
    submitFeedback(request: SubmitFeedbackRequest): Promise<{
        sentimentResult: SentimentResult;
        queuePosition: number;
    }>;
    /**
     * Start the background worker that polls the queue.
     * Uses setInterval for simplicity — in production, we'd use a proper
     * job scheduler or a message broker consumer.
     */
    startWorker(pollIntervalMs?: number): void;
    /** Stop the worker (for graceful shutdown) */
    stopWorker(): void;
    /**
     * Process one item from the queue.
     *
     * Why process one at a time instead of draining the whole queue?
     * - Prevents long-running loops that block the event loop
     * - Each item gets its own error boundary (one failure doesn't kill the batch)
     * - Easier to reason about and debug
     */
    private processNextItem;
}
export {};
//# sourceMappingURL=FeedbackProcessorService.d.ts.map