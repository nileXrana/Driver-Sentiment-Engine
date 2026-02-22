// Data Access Layer for Feedback documents.

import { FeedbackModel } from "../models/Feedback.model";
import { FeedbackDocument } from "../types/model.types";

export class FeedbackRepository {
  // Save a new feedback record to the database
  public async create(feedbackData: Partial<FeedbackDocument>): Promise<FeedbackDocument> {
    try {
      const feedback = new FeedbackModel(feedbackData);
      return await feedback.save();
    } catch (error) {
      console.error("[FeedbackRepository] Error creating feedback:", error);
      throw error;
    }
  }

  // Check if a user has already submitted feedback for a given driver on a given date
  public async existsByUserDriverAndDate(
    userName: string,
    driverId: string,
    feedbackDate: string
  ): Promise<boolean> {
    try {
      const count = await FeedbackModel.countDocuments({ userName, driverId, feedbackDate });
      return count > 0;
    } catch (error) {
      console.error("[FeedbackRepository] Error checking duplicate feedback:", error);
      throw error;
    }
  }

  // Get all feedback for a specific driver, newest first
  public async findByDriverId(driverId: string): Promise<FeedbackDocument[]> {
    try {
      return await FeedbackModel.find({ driverId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error(`[FeedbackRepository] Error finding feedback for '${driverId}':`, error);
      throw error;
    }
  }

  // Mark a feedback record as processed by the queue worker
  public async markAsProcessed(feedbackId: string): Promise<void> {
    try {
      await FeedbackModel.findByIdAndUpdate(feedbackId, { processed: true });
    } catch (error) {
      console.error(`[FeedbackRepository] Error marking feedback '${feedbackId}' as processed:`, error);
      throw error;
    }
  }
}
