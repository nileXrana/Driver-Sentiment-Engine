import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export function createAuthRoutes(authController: AuthController): Router {
    const router = Router();

    // POST /api/auth/login
    router.post("/login", authController.login.bind(authController));

    return router;
}
