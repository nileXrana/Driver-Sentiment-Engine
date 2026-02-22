"use strict";
/**
 * Database.ts
 * -----------
 * Singleton pattern for the MongoDB connection.
 *
 * Why Singleton?
 * We want exactly ONE connection pool shared across the entire app.
 * Multiple connections would waste memory and hit MongoDB's connection limit.
 * This is the same pattern Spring Boot uses with its DataSource bean.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    /** Private constructor prevents direct instantiation (Singleton) */
    constructor() {
        this.isConnected = false;
    }
    /** Get the single Database instance */
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    /**
     * Connect to MongoDB with retry logic.
     * In production, the initial connection attempt might fail if the
     * database is still spinning up, so we retry a few times.
     */
    async connect(uri) {
        if (this.isConnected) {
            console.log("[Database] Already connected, skipping.");
            return;
        }
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 2000;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await mongoose_1.default.connect(uri);
                this.isConnected = true;
                console.log(`[Database] Connected to MongoDB on attempt ${attempt}.`);
                return;
            }
            catch (error) {
                console.error(`[Database] Connection attempt ${attempt}/${MAX_RETRIES} failed:`, error);
                if (attempt === MAX_RETRIES) {
                    throw new Error("[Database] Could not connect after maximum retries.");
                }
                // Wait before retrying (simple exponential-ish backoff)
                await this.sleep(RETRY_DELAY_MS * attempt);
            }
        }
    }
    /** Gracefully close the connection (used in shutdown hooks) */
    async disconnect() {
        if (this.isConnected) {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            console.log("[Database] Disconnected from MongoDB.");
        }
    }
    /** Simple sleep utility - avoids pulling in a whole library */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map