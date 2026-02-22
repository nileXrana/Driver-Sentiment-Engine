"use strict";
/**
 * Alert.model.ts
 * ---------------
 * Mongoose schema for driver performance alerts.
 *
 * Alerts are created when a driver's rolling average drops
 * below the configured threshold. We store each alert for
 * audit trail purposes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertModel = void 0;
const mongoose_1 = require("mongoose");
const AlertSchema = new mongoose_1.Schema({
    driverId: {
        type: String,
        required: true,
        index: true,
    },
    driverName: {
        type: String,
        required: true,
    },
    alertType: {
        type: String,
        enum: ["LOW_SCORE"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    currentScore: {
        type: Number,
        required: true,
    },
    threshold: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true, // createdAt serves as our alert timestamp
});
exports.AlertModel = (0, mongoose_1.model)("Alert", AlertSchema);
//# sourceMappingURL=Alert.model.js.map