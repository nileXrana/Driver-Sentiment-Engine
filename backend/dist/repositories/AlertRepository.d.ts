/**
 * AlertRepository.ts
 * -------------------
 * Data Access Layer for Alert documents.
 */
import { AlertDocument } from "../types/model.types";
export declare class AlertRepository {
    /** Create a new alert record */
    create(alertData: Partial<AlertDocument>): Promise<AlertDocument>;
    /**
     * Find the most recent alert for a driver.
     * Used to check cooldown — if the last alert was too recent, we skip.
     */
    findLatestByDriverId(driverId: string): Promise<AlertDocument | null>;
    /** Get all alerts, optionally filtered by driver */
    findAll(driverId?: string): Promise<AlertDocument[]>;
}
//# sourceMappingURL=AlertRepository.d.ts.map