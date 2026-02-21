/**
 * Feedback.model.ts
 * ------------------
 * Mongoose schema for storing rider/marshal feedback.
 * 
 * Each feedback record stores the raw text AND the computed
 * sentiment result. This means we never need to re-analyze
 * old feedback — the score is computed once and stored.
 */

import { Schema, model } from "mongoose";
import { FeedbackDocument } from "../types/model.types";

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    driverId: {
      type: String,
      required: true,
      index: true, // We often query "all feedback for driver X"
    },
    tripId: {
      type: String,
      required: true,
    },
    feedbackText: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: String,
      enum: ["rider", "marshal", "system"],
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    feedbackDate: {
      type: String,   // "YYYY-MM-DD" format
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
  },
  {
    timestamps: true,
  }
);

export const FeedbackModel = model<FeedbackDocument>("Feedback", FeedbackSchema);
