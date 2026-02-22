/**
 * FeedbackRepository.ts
 * ----------------------
 * Data Access Layer for Feedback documents.
 */
import { FeedbackDocument } from "../types/model.types";
export declare class FeedbackRepository {
    /** Save a new feedback record to the database */
    create(feedbackData: Partial<FeedbackDocument>): Promise<FeedbackDocument>;
    /**
     * Check if a user has already submitted feedback for a given driver on a given date.
     * Returns true if a matching record exists.
     */
    existsByUserDriverAndDate(userName: string, driverId: string, feedbackDate: string): Promise<boolean>;
    /** Get all feedback for a specific driver, newest first */
    findByDriverId(driverId: string): Promise<FeedbackDocument[]>;
    /** Mark a feedback record as processed by the queue worker */
    markAsProcessed(feedbackId: string): Promise<void>;
}
//# sourceMappingURL=FeedbackRepository.d.ts.map