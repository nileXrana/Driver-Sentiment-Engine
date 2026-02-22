/**
 * IAlertService.ts
 * ----------------
 * Contract for the alert/notification subsystem.
 *
 * The alert service monitors driver scores and triggers
 * warnings when performance drops below a threshold.
 * It includes spam-prevention logic to avoid flooding.
 */
import { AlertDocument } from "../types/model.types";
export interface IAlertService {
    /**
     * Check if a driver's score is below the threshold and,
     * if so, create an alert — but only if we haven't alerted
     * for this driver recently (cooldown period).
     */
    checkAndAlert(driverId: string, currentScore: number): Promise<AlertDocument | null>;
    /** Get all alerts, optionally filtered by driver */
    getAlerts(driverId?: string): Promise<AlertDocument[]>;
}
//# sourceMappingURL=IAlertService.d.ts.map