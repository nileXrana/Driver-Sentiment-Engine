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
export {};
//# sourceMappingURL=Server.d.ts.map