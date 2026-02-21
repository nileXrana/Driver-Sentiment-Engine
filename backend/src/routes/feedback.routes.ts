/**
 * feedback.routes.ts
 * -------------------
 * Route definitions for feedback-related endpoints.
 * Separating routes from controllers keeps things clean and testable.
 */

import { Router } from "express";
import { FeedbackController } from "../controllers/FeedbackController";

export function createFeedbackRoutes(feedbackController: FeedbackController): Router {
  const router = Router();

  // POST /api/feedback — Submit new rider/marshal feedback
  router.post("/", feedbackController.submitFeedback);

  return router;
}
