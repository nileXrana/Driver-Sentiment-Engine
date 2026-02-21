/**
 * Alert.model.ts
 * ---------------
 * Mongoose schema for driver performance alerts.
 * 
 * Alerts are created when a driver's rolling average drops
 * below the configured threshold. We store each alert for
 * audit trail purposes.
 */

import { Schema, model } from "mongoose";
import { AlertDocument } from "../types/model.types";

const AlertSchema = new Schema<AlertDocument>(
  {
    driverId: {
      type: String,
      required: true,
      index: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ["LOW_SCORE"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    currentScore: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt serves as our alert timestamp
  }
);

export const AlertModel = model<AlertDocument>("Alert", AlertSchema);
