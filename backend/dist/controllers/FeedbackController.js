"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const response_types_1 = require("../types/response.types");
class FeedbackController {
    constructor(feedbackProcessor, feedbackRepository) {
        this.feedbackProcessor = feedbackProcessor;
        this.feedbackRepository = feedbackRepository;
        // Bind 'this' context so it works correctly when Express calls the method
        this.submitFeedback = this.submitFeedback.bind(this);
        this.checkDuplicate = this.checkDuplicate.bind(this);
        this.getDriverFeedback = this.getDriverFeedback.bind(this);
    }
    /**
     * GET /api/feedback/check?userName=X&driverId=DRV001&feedbackDate=2026-02-21
     *
     * Returns { exists: true/false } to let the frontend know if
     * the user has already submitted feedback for this driver on this date.
     */
    async checkDuplicate(req, res) {
        try {
            const { userName, driverId, feedbackDate } = req.query;
            if (!userName || !driverId || !feedbackDate) {
                res.status(400).json((0, response_types_1.buildErrorResponse)("Missing query params: userName, driverId, feedbackDate"));
                return;
            }
            const exists = await this.feedbackRepository.existsByUserDriverAndDate(String(userName), String(driverId), String(feedbackDate));
            res.status(200).json((0, response_types_1.buildSuccessResponse)({ exists }));
        }
        catch (error) {
            console.error("[FeedbackController] Error in checkDuplicate:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to check feedback."));
        }
    }
    /**
     * GET /api/feedback/:driverId
     *
     * Retrieves all feedback history for a specific driver.
     */
    async getDriverFeedback(req, res) {
        try {
            const { driverId } = req.params;
            if (!driverId) {
                res.status(400).json((0, response_types_1.buildErrorResponse)("Missing 'driverId' parameter."));
                return;
            }
            const feedbackData = await this.feedbackRepository.findByDriverId(driverId);
            res.status(200).json((0, response_types_1.buildSuccessResponse)(feedbackData, `Found ${feedbackData.length} feedback items.`));
        }
        catch (error) {
            console.error("[FeedbackController] Error in getDriverFeedback:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to retrieve feedback."));
        }
    }
    /**
     * POST /api/feedback
     *
     * Accepts rider/marshal feedback, runs sentiment analysis,
     * and enqueues the result for async processing.
     */
    async submitFeedback(req, res) {
        try {
            // Step 1: Extract and validate the request body
            const body = req.body;
            const validationError = this.validateFeedbackRequest(body);
            if (validationError) {
                res.status(400).json((0, response_types_1.buildErrorResponse)(validationError));
                return;
            }
            // Step 2: Submit to the feedback processor (analyzes + enqueues)
            const { sentimentResult, queuePosition } = await this.feedbackProcessor.submitFeedback(body);
            // Step 3: Build and return the response
            const responseData = {
                feedbackId: `fb_${Date.now()}`, // Temporary ID until DB processing completes
                driverId: body.driverId,
                sentimentScore: sentimentResult.score,
                sentimentLabel: sentimentResult.label,
                matchedWords: sentimentResult.matchedWords,
                queuePosition,
            };
            res.status(202).json((0, response_types_1.buildSuccessResponse)(responseData, "Feedback received and queued for processing."));
        }
        catch (error) {
            console.error("[FeedbackController] Error in submitFeedback:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Internal server error while processing feedback."));
        }
    }
    /**
     * Validate the incoming feedback request.
     * Returns an error message string if invalid, or null if valid.
     */
    validateFeedbackRequest(body) {
        if (!body.driverId || typeof body.driverId !== "string") {
            return "Missing or invalid 'driverId'. Must be a non-empty string.";
        }
        if (!body.driverName || typeof body.driverName !== "string") {
            return "Missing or invalid 'driverName'. Must be a non-empty string.";
        }
        if (!body.feedbackText || typeof body.feedbackText !== "string") {
            return "Missing or invalid 'feedbackText'. Must be a non-empty string.";
        }
        if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
            return "Missing or invalid 'rating'. Must be a number between 1 and 5.";
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
exports.FeedbackController = FeedbackController;
//# sourceMappingURL=FeedbackController.js.map