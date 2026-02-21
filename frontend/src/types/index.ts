/**
 * types/index.ts
 * ---------------
 * Shared TypeScript interfaces for the frontend.
 * These mirror the backend response shapes to keep both sides in sync.
 * In a real monorepo, these would live in a shared package.
 */

// ─── API Response Envelope ───────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

// ─── Feature Flags ───────────────────────────────────

export interface FeatureFlags {
  enableRiderFeedback: boolean;
  enableMarshalFeedback: boolean;
  enableTripIdField: boolean;
  enableSentimentDetails: boolean;
  enableAlertDashboard: boolean;
}

// ─── Feedback ────────────────────────────────────────

export interface SubmitFeedbackPayload {
  driverId: string;
  driverName: string;
  tripId: string;
  feedbackText: string;
  submittedBy: "rider" | "marshal";
  userName: string;
  feedbackDate: string;  // "YYYY-MM-DD"
}

export interface FeedbackResult {
  feedbackId: string;
  driverId: string;
  sentimentScore: number;
  sentimentLabel: string;
  matchedWords: string[];
  queuePosition: number;
}

// ─── Driver ──────────────────────────────────────────

export interface Driver {
  driverId: string;
  name: string;
  averageScore: number;
  totalTrips: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

// ─── Alert ───────────────────────────────────────────

export interface Alert {
  _id: string;
  driverId: string;
  driverName: string;
  alertType: string;
  message: string;
  currentScore: number;
  threshold: number;
  createdAt: string;
}

// ─── Component Props ─────────────────────────────────

export interface FeedbackFormProps {
  featureFlags: FeatureFlags;
}

export interface SentimentResultProps {
  result: FeedbackResult;
  showDetails: boolean;
}

export interface DriverTableProps {
  drivers: Driver[];
  onDriverSelect: (driverId: string) => void;
}

export interface ScoreChartProps {
  driverName: string;
  feedbackHistory: FeedbackHistoryItem[];
}

export interface AlertListProps {
  alerts: Alert[];
}

export interface FeedbackHistoryItem {
  tripId: string;
  sentimentScore: number;
  sentimentLabel: string;
  feedbackText: string;
  createdAt: string;
}
