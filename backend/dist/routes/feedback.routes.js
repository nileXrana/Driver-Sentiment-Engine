"use strict";
/**
 * feedback.routes.ts
 * -------------------
 * Route definitions for feedback-related endpoints.
 * Separating routes from controllers keeps things clean and testable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedbackRoutes = createFeedbackRoutes;
const express_1 = require("express");
function createFeedbackRoutes(feedbackController) {
    const router = (0, express_1.Router)();
    // GET /api/feedback/check — Check if feedback already exists for a user + driver + date
    router.get("/check", feedbackController.checkDuplicate);
    // POST /api/feedback — Submit new rider/marshal feedback
    router.post("/", feedbackController.submitFeedback);
    // GET /api/feedback/:driverId — Get feedback history for a specific driver
    router.get("/:driverId", feedbackController.getDriverFeedback);
    return router;
}
//# sourceMappingURL=feedback.routes.js.map