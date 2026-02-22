/**
 * FeatureFlagService.ts
 * ----------------------
 * Service layer wrapper around the static FeatureFlags config.
 *
 * Even though the flags are simple static data, wrapping them in
 * a service class maintains our Controller → Service → Config pattern
 * and makes it trivial to swap in a database-backed flag system later.
 */
import { FeatureFlagResponse } from "../types/response.types";
export declare class FeatureFlagService {
    /** Retrieve all feature flags */
    getFlags(): FeatureFlagResponse;
    /** Update a single flag */
    updateFlag(key: keyof FeatureFlagResponse, value: boolean): void;
}
//# sourceMappingURL=FeatureFlagService.d.ts.map