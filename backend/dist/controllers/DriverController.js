"use strict";
/**
 * DriverController.ts
 * --------------------
 * Handles HTTP requests for driver data (used by the admin dashboard).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const response_types_1 = require("../types/response.types");
class DriverController {
    constructor(driverService, alertService) {
        this.driverService = driverService;
        this.alertService = alertService;
        // Bind methods to preserve 'this' context in Express route handlers
        this.getAllDrivers = this.getAllDrivers.bind(this);
        this.getDriverById = this.getDriverById.bind(this);
        this.getAlerts = this.getAlerts.bind(this);
    }
    /**
     * GET /api/drivers
     * Returns all drivers with their current sentiment scores.
     * Used by the admin dashboard to populate the driver table.
     */
    async getAllDrivers(_req, res) {
        try {
            const drivers = await this.driverService.getAllDrivers();
            // Map Mongoose documents to clean response DTOs
            const responsePayload = drivers.map((driver) => ({
                driverId: driver.driverId,
                name: driver.name,
                averageScore: driver.averageScore,
                totalFeedback: driver.totalFeedback,
                riskLevel: driver.riskLevel,
            }));
            res.status(200).json((0, response_types_1.buildSuccessResponse)(responsePayload, `Found ${responsePayload.length} drivers.`));
        }
        catch (error) {
            console.error("[DriverController] Error in getAllDrivers:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to retrieve drivers."));
        }
    }
    /**
     * GET /api/drivers/:driverId
     * Returns a single driver's details plus their score history.
     */
    async getDriverById(req, res) {
        try {
            const { driverId } = req.params;
            if (!driverId) {
                res.status(400).json((0, response_types_1.buildErrorResponse)("Missing 'driverId' parameter."));
                return;
            }
            const driver = await this.driverService.getDriverById(driverId);
            if (!driver) {
                res.status(404).json((0, response_types_1.buildErrorResponse)(`Driver '${driverId}' not found.`));
                return;
            }
            const responsePayload = {
                driverId: driver.driverId,
                name: driver.name,
                totalFeedback: driver.totalFeedback,
                averageScore: driver.averageScore,
                riskLevel: driver.riskLevel,
            };
            res.status(200).json((0, response_types_1.buildSuccessResponse)(responsePayload));
        }
        catch (error) {
            console.error("[DriverController] Error in getDriverById:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to retrieve driver."));
        }
    }
    /**
     * GET /api/alerts
     * Returns all alerts. Optionally filtered by ?driverId=xxx query param.
     */
    async getAlerts(req, res) {
        try {
            const driverId = req.query.driverId;
            const alerts = await this.alertService.getAlerts(driverId);
            res.status(200).json((0, response_types_1.buildSuccessResponse)(alerts, `Found ${alerts.length} alerts.`));
        }
        catch (error) {
            console.error("[DriverController] Error in getAlerts:", error);
            res.status(500).json((0, response_types_1.buildErrorResponse)("Failed to retrieve alerts."));
        }
    }
}
exports.DriverController = DriverController;
//# sourceMappingURL=DriverController.js.map