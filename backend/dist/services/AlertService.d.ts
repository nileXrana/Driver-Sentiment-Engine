/**
 * AlertService.ts
 * ----------------
 * Monitors driver scores and triggers alerts when performance drops.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ANTI-SPAM LOGIC (for interview)                               │
 * │                                                               │
 * │ Without cooldown, a driver receiving 10 bad reviews in        │
 * │ 5 minutes would generate 10 alerts — overwhelming the admin. │
 * │                                                               │
 * │ Solution: Before creating an alert, we check the timestamp   │
 * │ of the last alert for this driver. If it's within the        │
 * │ cooldown window (default: 1 hour), we skip the new alert.    │
 * │                                                               │
 * │ This is a simple but effective rate-limiting strategy.        │
 * └──────────────────────────────────────────────────────────────┘
 */
import { IAlertService } from "../interfaces";
import { AlertRepository } from "../repositories/AlertRepository";
import { DriverRepository } from "../repositories/DriverRepository";
import { AlertDocument } from "../types/model.types";
export declare class AlertService implements IAlertService {
    private readonly alertRepository;
    private readonly driverRepository;
    /** Score threshold below which an alert is triggered */
    private readonly alertThreshold;
    /** Minimum seconds between alerts for the same driver */
    private readonly cooldownSeconds;
    constructor(alertRepository: AlertRepository, driverRepository: DriverRepository, alertThreshold?: number, cooldownSeconds?: number);
    /**
     * Check if a driver's score warrants an alert, respecting the cooldown.
     * Returns the created alert, or null if no alert was needed/allowed.
     */
    checkAndAlert(driverId: string, currentScore: number): Promise<AlertDocument | null>;
    /** Retrieve all alerts, optionally filtered by driverId */
    getAlerts(driverId?: string): Promise<AlertDocument[]>;
    /**
     * Check if the driver's last alert was within the cooldown window.
     *
     * Logic:
     *   timeSinceLastAlert = now - lastAlert.createdAt
     *   if timeSinceLastAlert < cooldownSeconds → still on cooldown
     */
    private isDriverOnAlertCooldown;
}
//# sourceMappingURL=AlertService.d.ts.map