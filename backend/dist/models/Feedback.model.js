"use strict";
/**
 * Feedback.model.ts
 * ------------------
 * Mongoose schema for storing rider/marshal feedback.
 *
 * Each feedback record stores the raw text AND the computed
 * sentiment result. This means we never need to re-analyze
 * old feedback — the score is computed once and stored.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModel = void 0;
const mongoose_1 = require("mongoose");
const FeedbackSchema = new mongoose_1.Schema({
    driverId: {
        type: String,
        required: true,
        index: true, // We often query "all feedback for driver X"
    },
    feedbackText: {
        type: String,
        required: true,
        trim: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    feedbackDate: {
        type: String, // "YYYY-MM-DD" format
        required: true,
        index: true,
    },
    sentimentScore: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    sentimentLabel: {
        type: String,
        enum: ["positive", "neutral", "negative"],
        required: true,
    },
    matchedWords: {
        type: [String],
        default: [],
    },
    processed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.FeedbackModel = (0, mongoose_1.model)("Feedback", FeedbackSchema);
//# sourceMappingURL=Feedback.model.js.map