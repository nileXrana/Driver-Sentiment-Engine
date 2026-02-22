// Config routes

import { Router } from "express";
import { ConfigController } from "../controllers/ConfigController";

export function createConfigRoutes(configController: ConfigController): Router {
  const router = Router();

  // GET /api/config/flags
  router.get("/flags", configController.getFlags);

  return router;
}
