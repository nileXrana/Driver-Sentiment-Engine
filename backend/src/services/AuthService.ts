import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model";

export class AuthService {
    /**
     * "Zero-Config" Seeder: Runs on server startup.
     * Checks if any users exist. If not, creates the default Admin and Employee demo accounts.
     */
    public static async seedDemoUsers(): Promise<void> {
        try {
            const userCount = await UserModel.countDocuments();
            if (userCount > 0) {
                console.log("[AuthService] Checking DB... Demo Users already exist.");
                return;
            }

            console.log("[AuthService] Checking DB... No users found. Seeding Demo Users...");

            // Hash passwords
            const salt = await bcrypt.genSalt(10);
            const adminPassword = await bcrypt.hash("admin123", salt);
            const empPassword = await bcrypt.hash("emp123", salt);

            // Create Admin
            await UserModel.create({
                email: "admin@moveinsync.com",
                password: adminPassword,
                role: "ADMIN",
            });

            // Create Employee
            await UserModel.create({
                email: "emp@moveinsync.com",
                password: empPassword,
                role: "EMPLOYEE",
            });

            console.log("[AuthService] Checking DB... Demo Users Created/Verified.");
        } catch (error) {
            console.error("[AuthService] Failed to seed demo users:", error);
        }
    }
}
