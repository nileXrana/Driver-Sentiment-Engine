/**
 * driver.routes.ts
 * -----------------
 * Route definitions for driver and alert endpoints.
 */

import { Router } from "express";
import { DriverController } from "../controllers/DriverController";

export function createDriverRoutes(driverController: DriverController): Router {
  const router = Router();

  // GET /api/drivers — List all drivers (admin dashboard)
  router.get("/", driverController.getAllDrivers);

  // GET /api/drivers/:driverId — Get a specific driver
  router.get("/:driverId", driverController.getDriverById);

  // GET /api/alerts — List all alerts (optional ?driverId= filter)
  router.get("/alerts/all", driverController.getAlerts);

  return router;
}
