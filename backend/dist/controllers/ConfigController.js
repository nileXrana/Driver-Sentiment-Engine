"use strict";
/**
 * ConfigController.ts
 * --------------------
 * Handles feature flag configuration endpoints.
 * The frontend calls this on page load to know which UI sections to render.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const response_types_1 = require("../types/response.types");
class ConfigController {
    constructor(featureFlagService) {
        this.featureFlagService = featureFlagService;
        this.getFlags = this.getFlags.bind(this);
    }
    /**
     * GET /api/config/flags
     * Returns all feature flags as a JSON object.
     * The frontend uses this to conditionally render UI components.
     */
    async getFlags(_req, res) {
        try {
            const flags = this.featureFlagService.getFlags();
            res.status(200).json((0, response_types_1.buildSuccessResponse)(flags, "Feature flags retrieved."));
        }
        catch (error) {
            console.error("[ConfigController] Error in getFlags:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to retrieve feature flags."));
        }
    }
}
exports.ConfigController = ConfigController;
//# sourceMappingURL=ConfigController.js.map