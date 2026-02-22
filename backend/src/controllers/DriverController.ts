// Driver Controller

import { Request, Response } from "express";
import { DriverService } from "../services/DriverService";
import { AlertService } from "../services/AlertService";
import { buildSuccessResponse, buildErrorResponse, DriverResponse } from "../types/response.types";
import { DriverDocument } from "../types/model.types";

export class DriverController {
  private readonly driverService: DriverService;
  private readonly alertService: AlertService;

  constructor(driverService: DriverService, alertService: AlertService) {
    this.driverService = driverService;
    this.alertService = alertService;

    // Bind methods to preserve 'this' context in Express route handlers
    this.getAllDrivers = this.getAllDrivers.bind(this);
    this.getDriverById = this.getDriverById.bind(this);
    this.getAlerts = this.getAlerts.bind(this);
  }

  // GET /api/drivers
  public async getAllDrivers(_req: Request, res: Response): Promise<void> {
    try {
      const drivers = await this.driverService.getAllDrivers();

      // Map Mongoose documents to clean response DTOs
      const responsePayload: DriverResponse[] = drivers.map((driver: DriverDocument) => ({
        driverId: driver.driverId,
        name: driver.name,
        averageScore: driver.averageScore,
        totalFeedback: driver.totalFeedback,
        riskLevel: driver.riskLevel,
      }));

      res.status(200).json(
        buildSuccessResponse(responsePayload, `Found ${responsePayload.length} drivers.`)
      );
    } catch (error) {
      console.error("[DriverController] Error in getAllDrivers:", error);
      res.status(500).json(buildErrorResponse("Failed to retrieve drivers."));
    }
  }

  // GET /api/drivers/:driverId
  public async getDriverById(req: Request, res: Response): Promise<void> {
    try {
      const { driverId } = req.params;

      if (!driverId) {
        res.status(400).json(buildErrorResponse("Missing 'driverId' parameter."));
        return;
      }

      const driver = await this.driverService.getDriverById(driverId);

      if (!driver) {
        res.status(404).json(buildErrorResponse(`Driver '${driverId}' not found.`));
        return;
      }

      const responsePayload: DriverResponse = {
        driverId: driver.driverId,
        name: driver.name,
        totalFeedback: driver.totalFeedback,
        averageScore: driver.averageScore,
        riskLevel: driver.riskLevel,
      };

      res.status(200).json(buildSuccessResponse(responsePayload));
    } catch (error) {
      console.error("[DriverController] Error in getDriverById:", error);
      res.status(500).json(buildErrorResponse("Failed to retrieve driver."));
    }
  }

  // GET /api/alerts
  public async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const driverId = req.query.driverId as string | undefined;
      const alerts = await this.alertService.getAlerts(driverId);

      res.status(200).json(
        buildSuccessResponse(alerts, `Found ${alerts.length} alerts.`)
      );
    } catch (error) {
      console.error("[DriverController] Error in getAlerts:", error);
      res.status(500).json(buildErrorResponse("Failed to retrieve alerts."));
    }
  }
}
