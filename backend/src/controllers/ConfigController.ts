/**
 * ConfigController.ts
 * --------------------
 * Handles feature flag configuration endpoints.
 * The frontend calls this on page load to know which UI sections to render.
 */

import { Request, Response } from "express";
import { FeatureFlagService } from "../services/FeatureFlagService";
import { buildSuccessResponse, buildErrorResponse } from "../types/response.types";

export class ConfigController {
  private readonly featureFlagService: FeatureFlagService;

  constructor(featureFlagService: FeatureFlagService) {
    this.featureFlagService = featureFlagService;

    this.getFlags = this.getFlags.bind(this);
  }

  /**
   * GET /api/config/flags
   * Returns all feature flags as a JSON object.
   * The frontend uses this to conditionally render UI components.
   */
  public async getFlags(_req: Request, res: Response): Promise<void> {
    try {
      const flags = this.featureFlagService.getFlags();
      res.status(200).json(buildSuccessResponse(flags, "Feature flags retrieved."));
    } catch (error) {
      console.error("[ConfigController] Error in getFlags:", error);
      res.status(500).json(buildErrorResponse("Failed to retrieve feature flags."));
    }
  }
}
