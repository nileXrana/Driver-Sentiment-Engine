"use strict";
/**
 * DriverRepository.ts
 * --------------------
 * Data Access Layer for Driver documents.
 *
 * Following the Repository Pattern (same as Spring Data JPA):
 * - Controllers never touch the database directly.
 * - Services call repository methods.
 * - Repositories encapsulate all Mongoose queries.
 *
 * This separation means if we ever switch from MongoDB to PostgreSQL,
 * only the repository layer needs to change.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRepository = void 0;
const Driver_model_1 = require("../models/Driver.model");
class DriverRepository {
    /**
     * Find a driver by their business ID (not MongoDB's _id).
     * Returns null if the driver doesn't exist yet.
     */
    async findByDriverId(driverId) {
        try {
            return await Driver_model_1.DriverModel.findOne({ driverId });
        }
        catch (error) {
            console.error(`[DriverRepository] Error finding driver '${driverId}':`, error);
            throw error;
        }
    }
    /** Retrieve all drivers, sorted by average score ascending (worst first) */
    async findAll() {
        try {
            return await Driver_model_1.DriverModel.find().sort({ averageScore: 1 });
        }
        catch (error) {
            console.error("[DriverRepository] Error fetching all drivers:", error);
            throw error;
        }
    }
    /** Create a new driver record */
    async create(driverId, name) {
        try {
            const driver = new Driver_model_1.DriverModel({
                driverId,
                name,
                totalScore: 0,
                totalFeedback: 0,
                averageScore: 0,
                riskLevel: "LOW",
            });
            return await driver.save();
        }
        catch (error) {
            console.error(`[DriverRepository] Error creating driver '${driverId}':`, error);
            throw error;
        }
    }
    /**
     * Atomic update of a driver's score.
     * This is much safer than reading the driver, computing, and saving it back,
     * which can cause race conditions if multiple feedbacks arrive simultaneously.
     */
    async updateScoreAtomically(driverId, newScore, newAverageScore, newRiskLevel) {
        try {
            return await Driver_model_1.DriverModel.findOneAndUpdate({ driverId }, {
                $inc: { totalScore: newScore, totalFeedback: 1 },
                $set: {
                    averageScore: newAverageScore,
                    riskLevel: newRiskLevel,
                },
            }, { new: true } // Return the updated document
            );
        }
        catch (error) {
            console.error(`[DriverRepository] Error updating score for '${driverId}':`, error);
            throw error;
        }
    }
}
exports.DriverRepository = DriverRepository;
//# sourceMappingURL=DriverRepository.js.map