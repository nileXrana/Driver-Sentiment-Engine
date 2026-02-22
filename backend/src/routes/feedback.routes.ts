// Feedback routes

import { Router } from "express";
import { FeedbackController } from "../controllers/FeedbackController";

export function createFeedbackRoutes(feedbackController: FeedbackController): Router {
  const router = Router();

  // GET /api/feedback/check
  router.get("/check", feedbackController.checkDuplicate);

  // POST /api/feedback
  router.post("/", feedbackController.submitFeedback);

  // GET /api/feedback/:driverId
  router.get("/:driverId", feedbackController.getDriverFeedback);

  return router;
}
