/**
 * FeatureFlags.ts
 * ----------------
 * Static configuration for feature flags.
 * 
 * In a real system, these would come from a database or a service
 * like LaunchDarkly. For our MVP, a simple config object works.
 * The frontend fetches these on load and conditionally renders UI.
 */

import { FeatureFlagResponse } from "../types/response.types";

export class FeatureFlags {
  /**
   * Current flag values.
   * An admin could update these at runtime through an API endpoint
   * without needing to redeploy the frontend.
   */
  private static flags: FeatureFlagResponse = {
    enableRiderFeedback: true,
    enableMarshalFeedback: false,
    enableTripIdField: true,
    enableSentimentDetails: true,
    enableAlertDashboard: true,
  };

  /** Get all flags (for the GET /config/flags endpoint) */
  public static getAll(): FeatureFlagResponse {
    return { ...this.flags }; // Return a copy to prevent mutation
  }

  /** Update a specific flag at runtime */
  public static setFlag(key: keyof FeatureFlagResponse, value: boolean): void {
    this.flags[key] = value;
    console.log(`[FeatureFlags] Updated '${key}' to ${value}`);
  }
}
