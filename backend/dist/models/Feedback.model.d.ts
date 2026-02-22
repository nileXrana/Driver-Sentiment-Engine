/**
 * Feedback.model.ts
 * ------------------
 * Mongoose schema for storing rider/marshal feedback.
 *
 * Each feedback record stores the raw text AND the computed
 * sentiment result. This means we never need to re-analyze
 * old feedback — the score is computed once and stored.
 */
import { FeedbackDocument } from "../types/model.types";
export declare const FeedbackModel: import("mongoose").Model<FeedbackDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, FeedbackDocument, {}, {}> & FeedbackDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Feedback.model.d.ts.map