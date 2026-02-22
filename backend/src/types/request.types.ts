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

  /** Raw feedback text - this gets analyzed by the sentiment engine */
  feedbackText: string;

  /** The explicit 1-5 star rating from the user */
  rating: number;

  /** Name of the user submitting feedback (for duplicate check before auth) */
  userName: string;

  /** Feedback date in "YYYY-MM-DD" format (today or previous working day) */
  feedbackDate: string;

  /** The exact words written specifically about the driver (if any) */
  driverFeedbackText?: string;

  /** The explicit 1-5 star rating specifically for the driver (if any) */
  driverRating?: number;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface GetDriverRequest {
  /** Driver ID passed as a URL parameter */
  driverId: string;
}
