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

  // GET /api/feedback/check — Check if feedback already exists for a user + driver + date
  router.get("/check", feedbackController.checkDuplicate);

  // POST /api/feedback — Submit new rider/marshal feedback
  router.post("/", feedbackController.submitFeedback);

  return router;
}
