/**
 * FeedbackController.ts
 * ----------------------
 * Handles HTTP requests related to feedback submission.
 * 
 * Follows the Single Responsibility Principle:
 * - Controller: Validates input, calls service, formats response
 * - Service: Contains business logic
 * - Repository: Handles data persistence
 * 
 * This is the same layering Spring Boot uses:
 *   @RestController → @Service → @Repository
 */

import { Request, Response } from "express";
import { FeedbackProcessorService } from "../services/FeedbackProcessorService";
import { FeedbackRepository } from "../repositories/FeedbackRepository";
import { SubmitFeedbackRequest } from "../types/request.types";
import { buildSuccessResponse, buildErrorResponse, FeedbackResponse } from "../types/response.types";

export class FeedbackController {
  private readonly feedbackProcessor: FeedbackProcessorService;
  private readonly feedbackRepository: FeedbackRepository;

  constructor(feedbackProcessor: FeedbackProcessorService, feedbackRepository: FeedbackRepository) {
    this.feedbackProcessor = feedbackProcessor;
    this.feedbackRepository = feedbackRepository;

    // Bind 'this' context so it works correctly when Express calls the method
    this.submitFeedback = this.submitFeedback.bind(this);
    this.checkDuplicate = this.checkDuplicate.bind(this);
  }

  /**
   * GET /api/feedback/check?userName=X&driverId=DRV001&feedbackDate=2026-02-21
   *
   * Returns { exists: true/false } to let the frontend know if
   * the user has already submitted feedback for this driver on this date.
   */
  public async checkDuplicate(req: Request, res: Response): Promise<void> {
    try {
      const { userName, driverId, feedbackDate } = req.query;

      if (!userName || !driverId || !feedbackDate) {
        res.status(400).json(buildErrorResponse("Missing query params: userName, driverId, feedbackDate"));
        return;
      }

      const exists = await this.feedbackRepository.existsByUserDriverAndDate(
        String(userName),
        String(driverId),
        String(feedbackDate)
      );

      res.status(200).json(buildSuccessResponse({ exists }));
    } catch (error) {
      console.error("[FeedbackController] Error in checkDuplicate:", error);
      res.status(500).json(buildErrorResponse("Failed to check feedback."));
    }
  }

  /**
   * POST /api/feedback
   * 
   * Accepts rider/marshal feedback, runs sentiment analysis,
   * and enqueues the result for async processing.
   */
  public async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Extract and validate the request body
      const body = req.body as SubmitFeedbackRequest;

      const validationError = this.validateFeedbackRequest(body);
      if (validationError) {
        res.status(400).json(buildErrorResponse(validationError));
        return;
      }

      // Step 2: Submit to the feedback processor (analyzes + enqueues)
      const { sentimentResult, queuePosition } = await this.feedbackProcessor.submitFeedback(body);

      // Step 3: Build and return the response
      const responseData: FeedbackResponse = {
        feedbackId: `fb_${Date.now()}`, // Temporary ID until DB processing completes
        driverId: body.driverId,
        sentimentScore: sentimentResult.score,
        sentimentLabel: sentimentResult.label,
        matchedWords: sentimentResult.matchedWords,
        queuePosition,
      };

      res.status(202).json(
        buildSuccessResponse(responseData, "Feedback received and queued for processing.")
      );
    } catch (error) {
      console.error("[FeedbackController] Error in submitFeedback:", error);
      res.status(500).json(
        buildErrorResponse("Internal server error while processing feedback.")
      );
    }
  }

  /**
   * Validate the incoming feedback request.
   * Returns an error message string if invalid, or null if valid.
   */
  private validateFeedbackRequest(body: SubmitFeedbackRequest): string | null {
    if (!body.driverId || typeof body.driverId !== "string") {
      return "Missing or invalid 'driverId'. Must be a non-empty string.";
    }
    if (!body.driverName || typeof body.driverName !== "string") {
      return "Missing or invalid 'driverName'. Must be a non-empty string.";
    }
    if (!body.tripId || typeof body.tripId !== "string") {
      return "Missing or invalid 'tripId'. Must be a non-empty string.";
    }
    if (!body.feedbackText || typeof body.feedbackText !== "string") {
      return "Missing or invalid 'feedbackText'. Must be a non-empty string.";
    }
    if (!body.submittedBy || !["rider", "marshal"].includes(body.submittedBy)) {
      return "Missing or invalid 'submittedBy'. Must be 'rider' or 'marshal'.";
    }
    if (!body.userName || typeof body.userName !== "string") {
      return "Missing or invalid 'userName'. Must be a non-empty string.";
    }
    if (!body.feedbackDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.feedbackDate)) {
      return "Missing or invalid 'feedbackDate'. Must be in YYYY-MM-DD format.";
    }
    return null; // All checks passed
  }
}
