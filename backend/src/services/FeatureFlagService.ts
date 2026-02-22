// Feature flag service wrapper

import { FeatureFlags } from "../config/FeatureFlags";
import { FeatureFlagResponse } from "../types/response.types";

export class FeatureFlagService {
  // Get flags
  public getFlags(): FeatureFlagResponse {
    return FeatureFlags.getAll();
  }

  // Update flag
  public updateFlag(key: keyof FeatureFlagResponse, value: boolean): void {
    FeatureFlags.setFlag(key, value);
  }
}
