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
export declare class FeedbackController {
    private readonly feedbackProcessor;
    private readonly feedbackRepository;
    constructor(feedbackProcessor: FeedbackProcessorService, feedbackRepository: FeedbackRepository);
    /**
     * GET /api/feedback/check?userName=X&driverId=DRV001&feedbackDate=2026-02-21
     *
     * Returns { exists: true/false } to let the frontend know if
     * the user has already submitted feedback for this driver on this date.
     */
    checkDuplicate(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/feedback/:driverId
     *
     * Retrieves all feedback history for a specific driver.
     */
    getDriverFeedback(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/feedback
     *
     * Accepts rider/marshal feedback, runs sentiment analysis,
     * and enqueues the result for async processing.
     */
    submitFeedback(req: Request, res: Response): Promise<void>;
    /**
     * Validate the incoming feedback request.
     * Returns an error message string if invalid, or null if valid.
     */
    private validateFeedbackRequest;
}
//# sourceMappingURL=FeedbackController.d.ts.map