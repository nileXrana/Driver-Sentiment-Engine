"use strict";
/**
 * config.routes.ts
 * -----------------
 * Route definitions for configuration endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfigRoutes = createConfigRoutes;
const express_1 = require("express");
function createConfigRoutes(configController) {
    const router = (0, express_1.Router)();
    // GET /api/config/flags — Retrieve feature flags
    router.get("/flags", configController.getFlags);
    return router;
}
//# sourceMappingURL=config.routes.js.map