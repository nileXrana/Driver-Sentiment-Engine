// API Client Wrapper

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
  // Generic fetch wrapper
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

  // Fetch feature flags
  public static async getFeatureFlags(): Promise<FeatureFlags> {
    const response = await this.request<FeatureFlags>("/config/flags");
    return response.data!;
  }

  // Authenticate user
  public static async login(payload: import("../types").LoginPayload): Promise<import("../types").AuthResponse> {
    const response = await this.request<import("../types").AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  // Submit feedback
  public static async submitFeedback(
    payload: SubmitFeedbackPayload
  ): Promise<FeedbackResult> {
    const response = await this.request<FeedbackResult>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  // Check for duplicate feedback
  public static async checkFeedbackExists(
    userName: string,
    driverId: string,
    feedbackDate: string
  ): Promise<boolean> {
    const params = new URLSearchParams({ userName, driverId, feedbackDate });
    const response = await this.request<{ exists: boolean }>(`/feedback/check?${params}`);
    return response.data!.exists;
  }

  // Get all drivers
  public static async getAllDrivers(): Promise<Driver[]> {
    const response = await this.request<Driver[]>("/drivers");
    return response.data!;
  }

  // Get driver by ID
  public static async getDriver(driverId: string): Promise<Driver> {
    const response = await this.request<Driver>(`/drivers/${driverId}`);
    return response.data!;
  }

  // Get all alerts
  public static async getAlerts(): Promise<Alert[]> {
    const response = await this.request<Alert[]>("/drivers/alerts/all");
    return response.data!;
  }

  // Get driver feedback history
  public static async getDriverFeedback(driverId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/feedback/${driverId}`);
    return response.data || [];
  }
}
