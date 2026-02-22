// Mongoose schema for driver performance alerts.

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
  });

export const AlertModel = model<AlertDocument>("Alert", AlertSchema);
