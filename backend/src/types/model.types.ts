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
   * we store the sum and the count.
   * newAverage = (totalScore + newScore) / (totalFeedback + 1)
   */
  totalScore: number;
  totalFeedback: number;
  averageScore: number;

  /** Risk classification derived from averageScore */
  riskLevel: "LOW" | "MEDIUM" | "HIGH";

  /** Timestamp tracking */
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document = our interface + Mongoose internal fields */
export interface DriverDocument extends IDriver, Document { }

// ─── User ──────────────────────────────────────────────────
export interface UserDocument extends Document {
  email: string;
  password?: string;
  role: "ADMIN" | "EMPLOYEE";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Feedback ────────────────────────────────────────────

export interface IFeedback {
  /** Which driver this feedback is about */
  driverId: string;

  /** The raw text feedback entered by the user */
  feedbackText: string;

  /** Name of the user submitting feedback (for duplicate checks before auth) */
  userName: string;

  /** Date this feedback is for: "YYYY-MM-DD" format (today or previous working day) */
  feedbackDate: string;

  /** The computed sentiment score (1-5) from our engine */
  sentimentScore: number;

  /** The sentiment label: "positive", "negative", "neutral" */
  sentimentLabel: "positive" | "negative" | "neutral";

  /** Words our engine matched for transparency */
  matchedWords: string[];

  /** Whether this feedback has been processed by the queue worker */
  processed: boolean;

  createdAt: Date;
}

export interface FeedbackDocument extends IFeedback, Document { }

// ─── Alert ───────────────────────────────────────────────

export interface IAlert {
  driverId: string;
  driverName: string;
  message: string;
  currentScore: number;
  threshold: number;
  createdAt: Date;
}

export interface AlertDocument extends IAlert, Document { }
