/**
 * DriverController.ts
 * --------------------
 * Handles HTTP requests for driver data (used by the admin dashboard).
 */
import { Request, Response } from "express";
import { DriverService } from "../services/DriverService";
import { AlertService } from "../services/AlertService";
export declare class DriverController {
    private readonly driverService;
    private readonly alertService;
    constructor(driverService: DriverService, alertService: AlertService);
    /**
     * GET /api/drivers
     * Returns all drivers with their current sentiment scores.
     * Used by the admin dashboard to populate the driver table.
     */
    getAllDrivers(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/drivers/:driverId
     * Returns a single driver's details plus their score history.
     */
    getDriverById(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/alerts
     * Returns all alerts. Optionally filtered by ?driverId=xxx query param.
     */
    getAlerts(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DriverController.d.ts.map