import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model";
import { LoginRequest } from "../types/request.types";

export class AuthController {
    /**
     * Validates standard user login and issues a signed JWT containing 
     * the user's role (ADMIN or EMPLOYEE).
     */
    public async login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required.",
                    data: null,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Check DB for matching email
            const user = await UserModel.findOne({ email });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials.",
                    data: null,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Very standard bcrypt comparison
            const isMatch = await bcrypt.compare(password, user.password!);
            if (!isMatch) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials.",
                    data: null,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Give them a non-expiring JWT purely for demo simplicity (usually 1h or 24h)
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || "fallfack_secret_for_zero_config_demos",
                { expiresIn: "7d" }
            );

            res.status(200).json({
                success: true,
                message: "Login successful.",
                data: {
                    token,
                    role: user.role,
                },
                timestamp: new Date().toISOString()
            });
            return;
        } catch (error) {
            console.error("[AuthController] Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during authentication.",
                data: null,
                timestamp: new Date().toISOString()
            });
            return;
        }
    }
}
