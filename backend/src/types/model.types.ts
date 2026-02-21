/**
 * model.types.ts
 * ---------------
 * Domain model types that represent the shape of our MongoDB documents.
 * These are used by repositories and services to maintain type safety.
 */

import { Document } from "mongoose";

// ─── Driver ──────────────────────────────────────────────

export interface IDriver {
  driverId: string;
  name: string;

  /**
   * Rolling average fields:
   * Instead of querying all past feedback to compute the average,
   * we store the running total and count. This gives us O(1) updates
   * instead of O(n) recalculations each time a new feedback comes in.
   */
  totalScore: number;
  totalTrips: number;
  averageScore: number;

  /** Risk classification derived from averageScore */
  riskLevel: "LOW" | "MEDIUM" | "HIGH";

  /** Timestamp tracking */
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document = our interface + Mongoose internal fields */
export interface DriverDocument extends IDriver, Document {}

// ─── Feedback ────────────────────────────────────────────

export interface IFeedback {
  /** Which driver this feedback is about */
  driverId: string;

  /** Which trip this feedback is associated with */
  tripId: string;

  /** The raw text feedback entered by the user */
  feedbackText: string;

  /** Who submitted it: "rider", "marshal", or "system" */
  submittedBy: "rider" | "marshal" | "system";

  /** Name of the user submitting feedback (for duplicate checks before auth) */
  userName: string;

  /** Date this feedback is for: "YYYY-MM-DD" format (today or previous working day) */
  feedbackDate: string;

  /** The computed sentiment score (1-5) from our engine */
  sentimentScore: number;

  /** The sentiment label: "Positive", "Negative", "Neutral" */
  sentimentLabel: string;

  /** Words our engine matched for transparency */
  matchedWords: string[];

  /** Whether this feedback has been processed by the queue worker */
  processed: boolean;

  createdAt: Date;
}

export interface FeedbackDocument extends IFeedback, Document {}

// ─── Alert ───────────────────────────────────────────────

export interface IAlert {
  driverId: string;
  driverName: string;
  alertType: "LOW_SCORE";
  message: string;
  currentScore: number;
  threshold: number;
  createdAt: Date;
}

export interface AlertDocument extends IAlert, Document {}
