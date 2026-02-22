// Mongoose schema for rider/marshal feedback and computed sentiment results.

import { Schema, model } from "mongoose";
import { FeedbackDocument } from "../types/model.types";

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    driverId: {
      type: String,
      required: true,
      index: true,
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
      type: String,
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
  },
  {
    timestamps: true,
  }
);

export const FeedbackModel = model<FeedbackDocument>("Feedback", FeedbackSchema);
