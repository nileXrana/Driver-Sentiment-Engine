/**
 * Driver.model.ts
 * ----------------
 * Mongoose schema and model for the Driver collection.
 * 
 * Key Design:
 * - totalScore and totalFeedback enable O(1) rolling average updates.
 * - riskLevel is derived from averageScore for quick dashboard queries.
 */

import { Schema, model } from "mongoose";
import { DriverDocument } from "../types/model.types";

const DriverSchema = new Schema<DriverDocument>(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for fast lookups by driverId
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    totalFeedback: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt
  }
);

export const DriverModel = model<DriverDocument>("Driver", DriverSchema);
