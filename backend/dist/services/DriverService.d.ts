/**
 * DriverService.ts
 * -----------------
 * Business logic for driver score management.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ROLLING AVERAGE ALGORITHM (for interview)                     │
 * │                                                               │
 * │ Instead of: AVG = SUM(all scores) / COUNT(all scores)         │
 * │   which requires reading ALL past feedback → O(n)            │
 * │                                                               │
 * │ We store: totalScore and totalFeedback in the driver document.   │
 * │ Update:   newAvg = (totalScore + newScore) / (totalFeedback + 1)│
 * │   This is O(1) — we only read/write the driver document.     │
 * │                                                               │
 * │ Savings: If a driver has 10,000 feedback items, the naive     │
 * │ approach reads 10,000 feedback docs. Ours reads 1 document.  │
 * └──────────────────────────────────────────────────────────────┘
 */
import { IDriverService } from "../interfaces";
import { DriverRepository } from "../repositories/DriverRepository";
import { DriverDocument } from "../types/model.types";
export declare class DriverService implements IDriverService {
    private readonly driverRepository;
    /** Dependency Injection: the repository is injected, not created inside */
    constructor(driverRepository: DriverRepository);
    /**
     * Update a driver's rolling average with a new sentiment score.
     * This is the heart of the system — called every time feedback is processed.
     */
    updateDriverScore(driverId: string, newSentimentScore: number): Promise<DriverDocument>;
    /** Retrieve a single driver by ID */
    getDriverById(driverId: string): Promise<DriverDocument | null>;
    /** Retrieve all drivers for the admin dashboard */
    getAllDrivers(): Promise<DriverDocument[]>;
    /**
     * Find an existing driver or create a new one.
     * This ensures we never crash on first feedback for a new driver.
     */
    findOrCreateDriver(driverId: string, name: string): Promise<DriverDocument>;
    /**
     * Classify risk level based on average score thresholds.
     *
     * HIGH:   score < 2.5  → Driver needs immediate attention
     * MEDIUM: score < 3.5  → Driver should be monitored
     * LOW:    score >= 3.5  → Driver is performing well
     */
    private classifyRiskLevel;
}
//# sourceMappingURL=DriverService.d.ts.map