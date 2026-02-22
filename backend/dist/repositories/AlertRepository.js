"use strict";
/**
 * AlertRepository.ts
 * -------------------
 * Data Access Layer for Alert documents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRepository = void 0;
const Alert_model_1 = require("../models/Alert.model");
class AlertRepository {
    /** Create a new alert record */
    async create(alertData) {
        try {
            const alert = new Alert_model_1.AlertModel(alertData);
            return await alert.save();
        }
        catch (error) {
            console.error("[AlertRepository] Error creating alert:", error);
            throw error;
        }
    }
    /**
     * Find the most recent alert for a driver.
     * Used to check cooldown — if the last alert was too recent, we skip.
     */
    async findLatestByDriverId(driverId) {
        try {
            return await Alert_model_1.AlertModel.findOne({ driverId }).sort({ createdAt: -1 });
        }
        catch (error) {
            console.error(`[AlertRepository] Error finding latest alert for '${driverId}':`, error);
            throw error;
        }
    }
    /** Get all alerts, optionally filtered by driver */
    async findAll(driverId) {
        try {
            const filter = driverId ? { driverId } : {};
            return await Alert_model_1.AlertModel.find(filter).sort({ createdAt: -1 });
        }
        catch (error) {
            console.error("[AlertRepository] Error fetching alerts:", error);
            throw error;
        }
    }
}
exports.AlertRepository = AlertRepository;
//# sourceMappingURL=AlertRepository.js.map