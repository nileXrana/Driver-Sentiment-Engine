// Monitors driver scores and emits alerts with a rate-limit cooldown.

import { IAlertService } from "../interfaces";
import { AlertRepository } from "../repositories/AlertRepository";
import { DriverRepository } from "../repositories/DriverRepository";
import { AlertDocument } from "../types/model.types";

export class AlertService implements IAlertService {
  private readonly alertRepository: AlertRepository;
  private readonly driverRepository: DriverRepository;

  // Alert threshold
  private readonly alertThreshold: number;

  // Cooldown seconds
  private readonly cooldownSeconds: number;

  constructor(
    alertRepository: AlertRepository,
    driverRepository: DriverRepository,
    alertThreshold: number = 2.5,
    cooldownSeconds: number = 3600
  ) {
    this.alertRepository = alertRepository;
    this.driverRepository = driverRepository;
    this.alertThreshold = alertThreshold;
    this.cooldownSeconds = cooldownSeconds;

    console.log(
      `[AlertService] Initialized — threshold: ${this.alertThreshold}, ` +
      `cooldown: ${this.cooldownSeconds}s`
    );
  }

  // Check if a driver's score warrants an alert
  public async checkAndAlert(driverId: string, currentScore: number): Promise<AlertDocument | null> {
    try {
      // Step 1: Is the score actually below our threshold?
      if (currentScore >= this.alertThreshold) {
        return null; // Score is fine, no alert needed
      }

      // Step 2: Check cooldown — has an alert been sent recently?
      const isOnCooldown = await this.isDriverOnAlertCooldown(driverId);
      if (isOnCooldown) {
        console.log(
          `[AlertService] Skipping alert for driver '${driverId}' — ` +
          `still within cooldown period.`
        );
        return null;
      }

      // Step 3: Fetch driver name for a readable alert message
      const driver = await this.driverRepository.findByDriverId(driverId);
      const driverName = driver?.name ?? "Unknown Driver";

      // Step 4: Create the alert
      const alert = await this.alertRepository.create({
        driverId,
        driverName,
        message: `Driver '${driverName}' (${driverId}) has a sentiment score of ${currentScore}, ` +
          `which is below the threshold of ${this.alertThreshold}. Immediate review recommended.`,
        currentScore,
        threshold: this.alertThreshold,
      });

      console.warn(
        `[AlertService] ⚠ ALERT CREATED for driver '${driverId}': ` +
        `score ${currentScore} < threshold ${this.alertThreshold}`
      );

      return alert;
    } catch (error) {
      console.error(`[AlertService] Error checking alert for '${driverId}':`, error);
      throw error;
    }
  }

  // Retrieve all alerts
  public async getAlerts(driverId?: string): Promise<AlertDocument[]> {
    try {
      return await this.alertRepository.findAll(driverId);
    } catch (error) {
      console.error("[AlertService] Error fetching alerts:", error);
      throw error;
    }
  }

  // Check if driver is on alert cooldown
  private async isDriverOnAlertCooldown(driverId: string): Promise<boolean> {
    const lastAlert = await this.alertRepository.findLatestByDriverId(driverId);

    // No previous alerts → not on cooldown
    if (!lastAlert) {
      return false;
    }

    const now = new Date();
    const lastAlertTime = new Date(lastAlert.createdAt);
    const elapsedSeconds = (now.getTime() - lastAlertTime.getTime()) / 1000;

    return elapsedSeconds < this.cooldownSeconds;
  }
}
