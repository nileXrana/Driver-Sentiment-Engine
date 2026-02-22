// Driver routes

import { Router } from "express";
import { DriverController } from "../controllers/DriverController";

export function createDriverRoutes(driverController: DriverController): Router {
  const router = Router();

  // GET /api/drivers
  router.get("/", driverController.getAllDrivers);

  // GET /api/drivers/:driverId
  router.get("/:driverId", driverController.getDriverById);

  // GET /api/alerts
  router.get("/alerts/all", driverController.getAlerts);

  return router;
}
