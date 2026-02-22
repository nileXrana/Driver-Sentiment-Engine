"use strict";
/**
 * FeatureFlags.ts
 * ----------------
 * Static configuration for feature flags.
 *
 * In a real system, these would come from a database or a service
 * like LaunchDarkly. For our MVP, a simple config object works.
 * The frontend fetches these on load and conditionally renders UI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlags = void 0;
class FeatureFlags {
    /** Get all flags (for the GET /config/flags endpoint) */
    static getAll() {
        return { ...this.flags }; // Return a copy to prevent mutation
    }
    /** Update a specific flag at runtime */
    static setFlag(key, value) {
        this.flags[key] = value;
        console.log(`[FeatureFlags] Updated '${key}' to ${value}`);
    }
}
exports.FeatureFlags = FeatureFlags;
/**
 * Current flag values.
 * An admin could update these at runtime through an API endpoint
 * without needing to redeploy the frontend.
 */
FeatureFlags.flags = {
    enableRiderFeedback: true,
    enableMarshalFeedback: false,
    enableTripIdField: true,
    enableSentimentDetails: true,
    enableAlertDashboard: true,
};
//# sourceMappingURL=FeatureFlags.js.map