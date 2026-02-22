// Feedback Processor Worker

import { InMemoryQueue } from "./InMemoryQueue";
import { SentimentAnalysisService } from "./SentimentAnalysisService";
import { DriverService } from "./DriverService";
import { AlertService } from "./AlertService";
import { FeedbackRepository } from "../repositories/FeedbackRepository";
import { SubmitFeedbackRequest } from "../types/request.types";
import { SentimentResult } from "../interfaces";

// Queued feedback item shape
interface QueuedFeedbackItem {
  request: SubmitFeedbackRequest;
  sentimentResult: SentimentResult;
  enqueuedAt: Date;
}

export class FeedbackProcessorService {
  private readonly feedbackQueue: InMemoryQueue<QueuedFeedbackItem>;
  private readonly sentimentEngine: SentimentAnalysisService;
  private readonly driverService: DriverService;
  private readonly alertService: AlertService;
  private readonly feedbackRepository: FeedbackRepository;

  // Interval handle
  private workerInterval: ReturnType<typeof setInterval> | null = null;

  // Track processed count
  private processedCount: number = 0;

  constructor(
    feedbackQueue: InMemoryQueue<QueuedFeedbackItem>,
    sentimentEngine: SentimentAnalysisService,
    driverService: DriverService,
    alertService: AlertService,
    feedbackRepository: FeedbackRepository
  ) {
    this.feedbackQueue = feedbackQueue;
    this.sentimentEngine = sentimentEngine;
    this.driverService = driverService;
    this.alertService = alertService;
    this.feedbackRepository = feedbackRepository;
  }

  // Submit new feedback item
  public async submitFeedback(request: SubmitFeedbackRequest): Promise<{
    sentimentResult: SentimentResult;
    queuePosition: number;
  }> {
    // Step 1: Analyze sentiment right away (synchronous, O(n) on text length)
    // Pass strictly the driver's text and rating to the engine so Marshal/App feedback doesn't pollute it
    const textToAnalyze = request.driverFeedbackText || "";
    const sentimentResult = this.sentimentEngine.analyze(textToAnalyze, request.driverRating);

    // Step 2: Ensure the driver record exists (create if first-time)
    await this.driverService.findOrCreateDriver(request.driverId, request.driverName);

    // Step 3: Enqueue for background processing (saves to DB, updates score)
    const queuePosition = this.feedbackQueue.enqueue({
      request,
      sentimentResult,
      enqueuedAt: new Date(),
    });

    console.log(
      `[FeedbackProcessor] Feedback for driver '${request.driverId}' enqueued ` +
      `at position ${queuePosition}. Sentiment: ${sentimentResult.label} (${sentimentResult.score})`
    );

    return { sentimentResult, queuePosition };
  }

  // Start background worker
  public startWorker(pollIntervalMs: number = 2000): void {
    console.log(`[FeedbackProcessor] Starting queue worker (polling every ${pollIntervalMs}ms)...`);

    this.workerInterval = setInterval(async () => {
      await this.processNextItem();
    }, pollIntervalMs);
  }

  // Stop worker
  public stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
      console.log(`[FeedbackProcessor] Worker stopped. Processed ${this.processedCount} items total.`);
    }
  }

  // Process next item from queue
  private async processNextItem(): Promise<void> {
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

      // Step 2: Update the driver's rolling average score (ONLY if driver feedback exists)
      let updatedDriver;
      const hasDriverFeedback = request.driverRating !== undefined || (request.driverFeedbackText && request.driverFeedbackText.trim().length > 0);

      if (hasDriverFeedback) {
        updatedDriver = await this.driverService.updateDriverScore(
          request.driverId,
          sentimentResult.score
        );
      } else {
        // App/Marshal only feedback - don't penalize the driver with a neutral score
        updatedDriver = await this.driverService.getDriverById(request.driverId);
        if (!updatedDriver) {
          updatedDriver = await this.driverService.findOrCreateDriver(request.driverId, request.driverName);
        }
        console.log(`[FeedbackProcessor] Skipped score update for driver '${request.driverId}' (No direct driver feedback)`);
      }

      // Step 3: Check if this score drop should trigger an alert
      await this.alertService.checkAndAlert(
        request.driverId,
        updatedDriver.averageScore
      );

      // Step 4: Mark feedback as fully processed
      await this.feedbackRepository.markAsProcessed(String(savedFeedback._id));

      this.processedCount++;
      console.log(
        `[FeedbackProcessor] ✓ Processed feedback for driver '${request.driverId}'. ` +
        `Total processed: ${this.processedCount}`
      );
    } catch (error) {
      // Log the error but don't crash the worker — it should keep running
      console.error("[FeedbackProcessor] Error processing queue item:", error);
    }
  }
}
