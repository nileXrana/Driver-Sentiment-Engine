// Application Entry Point

import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Config
import { Database } from "./config/Database";

// Repositories
import { DriverRepository } from "./repositories/DriverRepository";
import { FeedbackRepository } from "./repositories/FeedbackRepository";
import { AlertRepository } from "./repositories/AlertRepository";

// Services
import { SentimentAnalysisService } from "./services/SentimentAnalysisService";
import { InMemoryQueue } from "./services/InMemoryQueue";
import { DriverService } from "./services/DriverService";
import { AlertService } from "./services/AlertService";
import { FeedbackProcessorService } from "./services/FeedbackProcessorService";
import { FeatureFlagService } from "./services/FeatureFlagService";

// Controllers
import { FeedbackController } from "./controllers/FeedbackController";
import { DriverController } from "./controllers/DriverController";
import { ConfigController } from "./controllers/ConfigController";
import { AuthController } from "./controllers/AuthController";

// Routes
import { createFeedbackRoutes } from "./routes/feedback.routes";
import { createDriverRoutes } from "./routes/driver.routes";
import { createConfigRoutes } from "./routes/config.routes";
import { createAuthRoutes } from "./routes/auth.routes";

// Seed
import { seedDrivers } from "./seed/driverSeed";
import { AuthService } from "./services/AuthService";

class Server {
  private readonly app: Application;
  private readonly port: number;
  private feedbackProcessor: FeedbackProcessorService | null = null;

  constructor() {
    // Load environment variables from .env file
    dotenv.config();

    this.app = express();
    this.port = parseInt(process.env.PORT || "5000", 10);

    // Register global middleware
    this.setupMiddleware();
  }

  // Configure Express middleware
  private setupMiddleware(): void {
    // Parse JSON request bodies
    this.app.use(express.json());

    // Enable CORS for frontend (Next.js runs on port 3000)
    this.app.use(cors({
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

  // Wire dependencies and routes
  private setupDependencies(): void {
    // Repositories
    const driverRepository = new DriverRepository();
    const feedbackRepository = new FeedbackRepository();
    const alertRepository = new AlertRepository();

    // Services
    const sentimentEngine = new SentimentAnalysisService();

    const feedbackQueue = new InMemoryQueue<{
      request: import("./types/request.types").SubmitFeedbackRequest;
      sentimentResult: import("./interfaces").SentimentResult;
      enqueuedAt: Date;
    }>("FeedbackQueue", 10000);

    const driverService = new DriverService(driverRepository);

    const alertThreshold = parseFloat(process.env.ALERT_THRESHOLD || "2.5");
    const alertCooldown = parseInt(process.env.ALERT_COOLDOWN_SECONDS || "3600", 10);
    const alertService = new AlertService(
      alertRepository,
      driverRepository,
      alertThreshold,
      alertCooldown
    );

    const featureFlagService = new FeatureFlagService();

    this.feedbackProcessor = new FeedbackProcessorService(
      feedbackQueue,
      sentimentEngine,
      driverService,
      alertService,
      feedbackRepository
    );

    // Controllers
    const feedbackController = new FeedbackController(this.feedbackProcessor, feedbackRepository);
    const driverController = new DriverController(driverService, alertService);
    const configController = new ConfigController(featureFlagService);
    const authController = new AuthController();

    // Routes
    this.app.use("/api/auth", createAuthRoutes(authController));
    this.app.use("/api/feedback", createFeedbackRoutes(feedbackController));
    this.app.use("/api/drivers", createDriverRoutes(driverController));
    this.app.use("/api/config", createConfigRoutes(configController));

    // Health Check
    this.app.get("/api/health", (_req, res) => {
      res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        queueSize: feedbackQueue.size(),
      });
    });
  }

  // Start Server
  public async start(): Promise<void> {
    try {
      // Step 1: Connect to MongoDB
      const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
      const database = Database.getInstance();
      await database.connect(mongoUri);

      // Demo User Seeding
      await AuthService.seedDemoUsers();

      // Seed Db
      await seedDrivers();

      // Wire dependencies
      this.setupDependencies();

      // Start worker
      const pollInterval = parseInt(process.env.QUEUE_POLL_INTERVAL_MS || "2000", 10);
      this.feedbackProcessor!.startWorker(pollInterval);

      // Start HTTP server
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

      // Shutdown hooks
      this.setupGracefulShutdown(database);
    } catch (error) {
      console.error("[Server] Failed to start:", error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  private setupGracefulShutdown(database: Database): void {
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      this.feedbackProcessor?.stopWorker();
      await database.disconnect();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
}

// Bootstrap application
const server = new Server();
server.start();
