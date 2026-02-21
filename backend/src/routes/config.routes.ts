/**
 * config.routes.ts
 * -----------------
 * Route definitions for configuration endpoints.
 */

import { Router } from "express";
import { ConfigController } from "../controllers/ConfigController";

export function createConfigRoutes(configController: ConfigController): Router {
  const router = Router();

  // GET /api/config/flags — Retrieve feature flags
  router.get("/flags", configController.getFlags);

  return router;
}
