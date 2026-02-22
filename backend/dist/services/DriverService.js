"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
class DriverService {
    /** Dependency Injection: the repository is injected, not created inside */
    constructor(driverRepository) {
        this.driverRepository = driverRepository;
    }
    /**
     * Update a driver's rolling average with a new sentiment score.
     * This is the heart of the system — called every time feedback is processed.
     */
    async updateDriverScore(driverId, newSentimentScore) {
        try {
            // Step 1: Fetch the current driver record
            const driver = await this.driverRepository.findByDriverId(driverId);
            if (!driver) {
                throw new Error(`Driver '${driverId}' not found. Cannot update score.`);
            }
            // Step 2: Compute the new rolling average (O(1) operation)
            const newTotalScore = driver.totalScore + newSentimentScore;
            const newTotalFeedback = driver.totalFeedback + 1;
            const newAverageScore = Math.round((newTotalScore / newTotalFeedback) * 100) / 100;
            // Step 3: Derive risk level from the new average
            const newRiskLevel = this.classifyRiskLevel(newAverageScore);
            console.log(`[DriverService] Updating driver '${driverId}': ` +
                `score ${driver.averageScore} → ${newAverageScore} (${newRiskLevel})`);
            // Step 4: Persist atomically to the database
            const updatedDriver = await this.driverRepository.updateScoreAtomically(driverId, newSentimentScore, newAverageScore, newRiskLevel);
            if (!updatedDriver) {
                throw new Error(`Failed to update driver '${driverId}' — document not found during write.`);
            }
            return updatedDriver;
        }
        catch (error) {
            console.error(`[DriverService] Error updating score for '${driverId}':`, error);
            throw error;
        }
    }
    /** Retrieve a single driver by ID */
    async getDriverById(driverId) {
        try {
            return await this.driverRepository.findByDriverId(driverId);
        }
        catch (error) {
            console.error(`[DriverService] Error getting driver '${driverId}':`, error);
            throw error;
        }
    }
    /** Retrieve all drivers for the admin dashboard */
    async getAllDrivers() {
        try {
            return await this.driverRepository.findAll();
        }
        catch (error) {
            console.error("[DriverService] Error getting all drivers:", error);
            throw error;
        }
    }
    /**
     * Find an existing driver or create a new one.
     * This ensures we never crash on first feedback for a new driver.
     */
    async findOrCreateDriver(driverId, name) {
        try {
            const existingDriver = await this.driverRepository.findByDriverId(driverId);
            if (existingDriver) {
                return existingDriver;
            }
            console.log(`[DriverService] Driver '${driverId}' not found. Creating new record.`);
            return await this.driverRepository.create(driverId, name);
        }
        catch (error) {
            console.error(`[DriverService] Error in findOrCreateDriver for '${driverId}':`, error);
            throw error;
        }
    }
    /**
     * Classify risk level based on average score thresholds.
     *
     * HIGH:   score < 2.5  → Driver needs immediate attention
     * MEDIUM: score < 3.5  → Driver should be monitored
     * LOW:    score >= 3.5  → Driver is performing well
     */
    classifyRiskLevel(averageScore) {
        if (averageScore < 2.5)
            return "HIGH";
        if (averageScore < 3.5)
            return "MEDIUM";
        return "LOW";
    }
}
exports.DriverService = DriverService;
//# sourceMappingURL=DriverService.js.map