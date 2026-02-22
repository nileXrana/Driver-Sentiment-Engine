"use strict";
/**
 * FeedbackRepository.ts
 * ----------------------
 * Data Access Layer for Feedback documents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRepository = void 0;
const Feedback_model_1 = require("../models/Feedback.model");
class FeedbackRepository {
    /** Save a new feedback record to the database */
    async create(feedbackData) {
        try {
            const feedback = new Feedback_model_1.FeedbackModel(feedbackData);
            return await feedback.save();
        }
        catch (error) {
            console.error("[FeedbackRepository] Error creating feedback:", error);
            throw error;
        }
    }
    /**
     * Check if a user has already submitted feedback for a given driver on a given date.
     * Returns true if a matching record exists.
     */
    async existsByUserDriverAndDate(userName, driverId, feedbackDate) {
        try {
            const count = await Feedback_model_1.FeedbackModel.countDocuments({ userName, driverId, feedbackDate });
            return count > 0;
        }
        catch (error) {
            console.error("[FeedbackRepository] Error checking duplicate feedback:", error);
            throw error;
        }
    }
    /** Get all feedback for a specific driver, newest first */
    async findByDriverId(driverId) {
        try {
            return await Feedback_model_1.FeedbackModel.find({ driverId }).sort({ createdAt: -1 });
        }
        catch (error) {
            console.error(`[FeedbackRepository] Error finding feedback for '${driverId}':`, error);
            throw error;
        }
    }
    /** Mark a feedback record as processed by the queue worker */
    async markAsProcessed(feedbackId) {
        try {
            await Feedback_model_1.FeedbackModel.findByIdAndUpdate(feedbackId, { processed: true });
        }
        catch (error) {
            console.error(`[FeedbackRepository] Error marking feedback '${feedbackId}' as processed:`, error);
            throw error;
        }
    }
}
exports.FeedbackRepository = FeedbackRepository;
//# sourceMappingURL=FeedbackRepository.js.map