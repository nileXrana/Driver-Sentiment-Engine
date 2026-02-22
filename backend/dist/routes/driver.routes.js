"use strict";
/**
 * driver.routes.ts
 * -----------------
 * Route definitions for driver and alert endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDriverRoutes = createDriverRoutes;
const express_1 = require("express");
function createDriverRoutes(driverController) {
    const router = (0, express_1.Router)();
    // GET /api/drivers — List all drivers (admin dashboard)
    router.get("/", driverController.getAllDrivers);
    // GET /api/drivers/:driverId — Get a specific driver
    router.get("/:driverId", driverController.getDriverById);
    // GET /api/alerts — List all alerts (optional ?driverId= filter)
    router.get("/alerts/all", driverController.getAlerts);
    return router;
}
//# sourceMappingURL=driver.routes.js.map