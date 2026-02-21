/**
 * response.types.ts
 * ------------------
 * Standardized API response shapes.
 * 
 * Every API response wraps data in a consistent envelope so the
 * frontend always knows what structure to expect. This is similar
 * to Spring Boot's ResponseEntity pattern.
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

export interface FeedbackResponse {
  feedbackId: string;
  driverId: string;
  sentimentScore: number;
  sentimentLabel: string;
  matchedWords: string[];
  queuePosition: number;
}

export interface DriverResponse {
  driverId: string;
  name: string;
  averageScore: number;
  totalTrips: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface FeatureFlagResponse {
  enableRiderFeedback: boolean;
  enableMarshalFeedback: boolean;
  enableTripIdField: boolean;
  enableSentimentDetails: boolean;
  enableAlertDashboard: boolean;
}

/** Utility to build a standardized success response */
export function buildSuccessResponse<T>(data: T, message: string = "Success"): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/** Utility to build a standardized error response */
export function buildErrorResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };
}
