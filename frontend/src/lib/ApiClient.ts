/**
 * ApiClient.ts
 * -------------
 * Centralized HTTP client for communicating with the Express backend.
 * 
 * All API calls go through this class so we have a single place to:
 *   - Set the base URL
 *   - Handle errors consistently
 *   - Add auth headers later if needed
 * 
 * This is similar to Retrofit in Android or Axios instances in larger apps.
 */

import {
  ApiResponse,
  FeatureFlags,
  SubmitFeedbackPayload,
  FeedbackResult,
  Driver,
  Alert,
} from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export class ApiClient {
  /**
   * Generic fetch wrapper with error handling.
   * Every API method calls this internally.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[ApiClient] Error on ${endpoint}:`, error);
      throw error;
    }
  }

  /** GET /api/config/flags - Fetch feature flags for conditional rendering */
  public static async getFeatureFlags(): Promise<FeatureFlags> {
    const response = await this.request<FeatureFlags>("/config/flags");
    return response.data!;
  }

  /** POST /api/feedback - Submit rider/marshal feedback */
  public static async submitFeedback(
    payload: SubmitFeedbackPayload
  ): Promise<FeedbackResult> {
    const response = await this.request<FeedbackResult>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  /** GET /api/feedback/check - Check if user already submitted feedback for a driver on a date */
  public static async checkFeedbackExists(
    userName: string,
    driverId: string,
    feedbackDate: string
  ): Promise<boolean> {
    const params = new URLSearchParams({ userName, driverId, feedbackDate });
    const response = await this.request<{ exists: boolean }>(`/feedback/check?${params}`);
    return response.data!.exists;
  }

  /** GET /api/drivers - Fetch all drivers for the dashboard */
  public static async getAllDrivers(): Promise<Driver[]> {
    const response = await this.request<Driver[]>("/drivers");
    return response.data!;
  }

  /** GET /api/drivers/:id - Fetch a single driver */
  public static async getDriver(driverId: string): Promise<Driver> {
    const response = await this.request<Driver>(`/drivers/${driverId}`);
    return response.data!;
  }

  /** GET /api/drivers/alerts/all - Fetch all alerts */
  public static async getAlerts(): Promise<Alert[]> {
    const response = await this.request<Alert[]>("/drivers/alerts/all");
    return response.data!;
  }

  /** GET /api/feedback/:driverId - Fetch all feedback history for a driver */
  public static async getDriverFeedback(driverId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/feedback/${driverId}`);
    return response.data || [];
  }
}
