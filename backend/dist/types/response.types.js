"use strict";
/**
 * response.types.ts
 * ------------------
 * Standardized API response shapes.
 *
 * Every API response wraps data in a consistent envelope so the
 * frontend always knows what structure to expect. This is similar
 * to Spring Boot's ResponseEntity pattern.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSuccessResponse = buildSuccessResponse;
exports.buildErrorResponse = buildErrorResponse;
/** Utility to build a standardized success response */
function buildSuccessResponse(data, message = "Success") {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}
/** Utility to build a standardized error response */
function buildErrorResponse(message) {
    return {
        success: false,
        message,
        data: null,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=response.types.js.map