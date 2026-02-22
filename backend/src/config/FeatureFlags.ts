// Static configuration for feature flags.

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { FeatureFlagResponse } from "../types/response.types";

export class FeatureFlags {
  // Current flag values
  private static flags: Partial<FeatureFlagResponse> = {
    enableTripIdField: false, // Deprecated
    enableSentimentDetails: true,
    enableAlertDashboard: true,
  };

  // Get all flags
  public static getAll(): FeatureFlagResponse {
    // Hot-reload .env from disk so admin toggles apply instantly without server restart
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
          process.env[k] = envConfig[k];
        }
      }
    } catch (err) {
      console.warn('[FeatureFlags] Could not hot-reload .env file:', err);
    }

    return {
      ...this.flags,
      enableRiderFeedback: process.env.ENABLE_RIDER_FEEDBACK !== 'false',
      enableMarshalFeedback: process.env.ENABLE_MARSHAL_FEEDBACK === 'true',
      enableAppFeedback: process.env.ENABLE_APP_FEEDBACK === 'true',
    } as FeatureFlagResponse;
  }

  // Update a specific flag at runtime
  public static setFlag(key: keyof FeatureFlagResponse, value: boolean): void {
    this.flags[key] = value;
    console.log(`[FeatureFlags] Updated '${key}' to ${value}`);
  }
}
