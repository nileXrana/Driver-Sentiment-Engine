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
export declare class FeatureFlags {
    /**
     * Current flag values.
     * An admin could update these at runtime through an API endpoint
     * without needing to redeploy the frontend.
     */
    private static flags;
    /** Get all flags (for the GET /config/flags endpoint) */
    static getAll(): FeatureFlagResponse;
    /** Update a specific flag at runtime */
    static setFlag(key: keyof FeatureFlagResponse, value: boolean): void;
}
//# sourceMappingURL=FeatureFlags.d.ts.map