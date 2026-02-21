/**
 * FeatureFlagService.ts
 * ----------------------
 * Service layer wrapper around the static FeatureFlags config.
 * 
 * Even though the flags are simple static data, wrapping them in
 * a service class maintains our Controller → Service → Config pattern
 * and makes it trivial to swap in a database-backed flag system later.
 */

import { FeatureFlags } from "../config/FeatureFlags";
import { FeatureFlagResponse } from "../types/response.types";

export class FeatureFlagService {
  /** Retrieve all feature flags */
  public getFlags(): FeatureFlagResponse {
    return FeatureFlags.getAll();
  }

  /** Update a single flag */
  public updateFlag(key: keyof FeatureFlagResponse, value: boolean): void {
    FeatureFlags.setFlag(key, value);
  }
}
