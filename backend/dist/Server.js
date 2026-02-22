"use strict";
/**
 * Server.ts
 * ----------
 * Application Entry Point — the "main" method of our system.
 *
 * This file is responsible for:
 *   1. Loading environment variables
 *   2. Connecting to MongoDB
 *   3. Wiring up all dependencies (Poor Man's Dependency Injection)
 *   4. Registering routes
 *   5. Starting the HTTP server and queue worker
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ DEPENDENCY INJECTION PATTERN (for interview)                  │
 * │                                                               │
 * │ In Spring Boot, dependencies are auto-wired with @Autowired. │
 * │ In our Express app, we manually wire them in this file.       │
 * │ This is called "Poor Man's DI" — simple but explicit.        │
 * │                                                               │
 * │ The object graph:                                             │
 * │   Repositories → Services → Controllers → Routes → Express   │
 * │                                                               │
 * │ Every class receives its dependencies through the constructor,│
 * │ never creating them internally. This makes testing easy.      │
 * └──────────────────────────────────────────────────────────────┘
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Config
const Database_1 = require("./config/Database");
// Repositories
const DriverRepository_1 = require("./repositories/DriverRepository");
const FeedbackRepository_1 = require("./repositories/FeedbackRepository");
const AlertRepository_1 = require("./repositories/AlertRepository");
// Services
const SentimentAnalysisService_1 = require("./services/SentimentAnalysisService");
const InMemoryQueue_1 = require("./services/InMemoryQueue");
const DriverService_1 = require("./services/DriverService");
const AlertService_1 = require("./services/AlertService");
const FeedbackProcessorService_1 = require("./services/FeedbackProcessorService");
const FeatureFlagService_1 = require("./services/FeatureFlagService");
// Controllers
const FeedbackController_1 = require("./controllers/FeedbackController");
const DriverController_1 = require("./controllers/DriverController");
const ConfigController_1 = require("./controllers/ConfigController");
// Routes
const feedback_routes_1 = require("./routes/feedback.routes");
const driver_routes_1 = require("./routes/driver.routes");
const config_routes_1 = require("./routes/config.routes");
// Seed
const driverSeed_1 = require("./seed/driverSeed");
class Server {
    constructor() {
        this.feedbackProcessor = null;
        // Load environment variables from .env file
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || "5000", 10);
        // Register global middleware
        this.setupMiddleware();
    }
    /** Configure Express middleware */
    setupMiddleware() {
        // Parse JSON request bodies
        this.app.use(express_1.default.json());
        // Enable CORS for frontend (Next.js runs on port 3000)
        this.app.use((0, cors_1.default)({
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"],
        }));
        // Simple request logger (replace with Morgan in production)
        this.app.use((req, _res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            next();
        });
    }
    /**
     * Wire up all dependencies and register routes.
     * This is our "composition root" — the single place where
     * all objects are created and connected.
     */
    setupDependencies() {
        // ─── Layer 1: Repositories (Data Access) ───────
        const driverRepository = new DriverRepository_1.DriverRepository();
        const feedbackRepository = new FeedbackRepository_1.FeedbackRepository();
        const alertRepository = new AlertRepository_1.AlertRepository();
        // ─── Layer 2: Services (Business Logic) ────────
        const sentimentEngine = new SentimentAnalysisService_1.SentimentAnalysisService();
        const feedbackQueue = new InMemoryQueue_1.InMemoryQueue("FeedbackQueue", 10000);
        const driverService = new DriverService_1.DriverService(driverRepository);
        const alertThreshold = parseFloat(process.env.ALERT_THRESHOLD || "2.5");
        const alertCooldown = parseInt(process.env.ALERT_COOLDOWN_SECONDS || "3600", 10);
        const alertService = new AlertService_1.AlertService(alertRepository, driverRepository, alertThreshold, alertCooldown);
        const featureFlagService = new FeatureFlagService_1.FeatureFlagService();
        this.feedbackProcessor = new FeedbackProcessorService_1.FeedbackProcessorService(feedbackQueue, sentimentEngine, driverService, alertService, feedbackRepository);
        // ─── Layer 3: Controllers (HTTP Handlers) ──────
        const feedbackController = new FeedbackController_1.FeedbackController(this.feedbackProcessor, feedbackRepository);
        const driverController = new DriverController_1.DriverController(driverService, alertService);
        const configController = new ConfigController_1.ConfigController(featureFlagService);
        // ─── Layer 4: Routes ───────────────────────────
        this.app.use("/api/feedback", (0, feedback_routes_1.createFeedbackRoutes)(feedbackController));
        this.app.use("/api/drivers", (0, driver_routes_1.createDriverRoutes)(driverController));
        this.app.use("/api/config", (0, config_routes_1.createConfigRoutes)(configController));
        // ─── Health Check Endpoint ─────────────────────
        this.app.get("/api/health", (_req, res) => {
            res.status(200).json({
                status: "UP",
                timestamp: new Date().toISOString(),
                queueSize: feedbackQueue.size(),
            });
        });
    }
    /** Connect to MongoDB, wire dependencies, start server + queue worker */
    async start() {
        try {
            // Step 1: Connect to MongoDB
            const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
            const database = Database_1.Database.getInstance();
            await database.connect(mongoUri);
            // Step 2: Seed the database with known drivers (upsert — safe on every boot)
            await (0, driverSeed_1.seedDrivers)();
            // Step 3: Wire up all dependencies
            this.setupDependencies();
            // Step 4: Start the queue worker
            const pollInterval = parseInt(process.env.QUEUE_POLL_INTERVAL_MS || "2000", 10);
            this.feedbackProcessor.startWorker(pollInterval);
            // Step 5: Start listening for HTTP requests
            this.app.listen(this.port, () => {
                console.log("═══════════════════════════════════════════════════");
                console.log("  Driver Sentiment Engine - Backend Server");
                console.log(`  Running on http://localhost:${this.port}`);
                console.log("  Endpoints:");
                console.log(`    POST /api/feedback          - Submit feedback`);
                console.log(`    GET  /api/drivers           - List all drivers`);
                console.log(`    GET  /api/drivers/:id       - Get single driver`);
                console.log(`    GET  /api/drivers/alerts/all - List alerts`);
                console.log(`    GET  /api/config/flags      - Feature flags`);
                console.log(`    GET  /api/health            - Health check`);
                console.log("═══════════════════════════════════════════════════");
            });
            // Step 6: Graceful shutdown hooks
            this.setupGracefulShutdown(database);
        }
        catch (error) {
            console.error("[Server] Failed to start:", error);
            process.exit(1);
        }
    }
    /** Handle SIGINT/SIGTERM for clean shutdown */
    setupGracefulShutdown(database) {
        const shutdown = async (signal) => {
            console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
            this.feedbackProcessor?.stopWorker();
            await database.disconnect();
            process.exit(0);
        };
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    }
}
// ─── Bootstrap the application ───────────────────────
const server = new Server();
server.start();
//# sourceMappingURL=Server.js.map