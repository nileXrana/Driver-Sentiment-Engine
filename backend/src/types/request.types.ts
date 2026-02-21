/**
 * request.types.ts
 * -----------------
 * Data Transfer Objects (DTOs) for incoming API requests.
 * 
 * Using typed request bodies ensures we catch malformed
 * data at compile time, not at runtime in production.
 */

export interface SubmitFeedbackRequest {
  /** Unique identifier for the driver being reviewed */
  driverId: string;

  /** The driver's display name (used to auto-create driver records) */
  driverName: string;

  /** Trip identifier to link feedback to a specific ride */
  tripId: string;

  /** Raw feedback text - this gets analyzed by the sentiment engine */
  feedbackText: string;

  /** Who is submitting: rider or marshal */
  submittedBy: "rider" | "marshal";
}

export interface GetDriverRequest {
  /** Driver ID passed as a URL parameter */
  driverId: string;
}
