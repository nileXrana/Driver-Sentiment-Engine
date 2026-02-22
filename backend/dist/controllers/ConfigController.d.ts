/**
 * ConfigController.ts
 * --------------------
 * Handles feature flag configuration endpoints.
 * The frontend calls this on page load to know which UI sections to render.
 */
import { Request, Response } from "express";
import { FeatureFlagService } from "../services/FeatureFlagService";
export declare class ConfigController {
    private readonly featureFlagService;
    constructor(featureFlagService: FeatureFlagService);
    /**
     * GET /api/config/flags
     * Returns all feature flags as a JSON object.
     * The frontend uses this to conditionally render UI components.
     */
    getFlags(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ConfigController.d.ts.map