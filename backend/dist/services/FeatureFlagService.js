"use strict";
/**
 * FeatureFlagService.ts
 * ----------------------
 * Service layer wrapper around the static FeatureFlags config.
 *
 * Even though the flags are simple static data, wrapping them in
 * a service class maintains our Controller → Service → Config pattern
 * and makes it trivial to swap in a database-backed flag system later.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagService = void 0;
const FeatureFlags_1 = require("../config/FeatureFlags");
class FeatureFlagService {
    /** Retrieve all feature flags */
    getFlags() {
        return FeatureFlags_1.FeatureFlags.getAll();
    }
    /** Update a single flag */
    updateFlag(key, value) {
        FeatureFlags_1.FeatureFlags.setFlag(key, value);
    }
}
exports.FeatureFlagService = FeatureFlagService;
//# sourceMappingURL=FeatureFlagService.js.map