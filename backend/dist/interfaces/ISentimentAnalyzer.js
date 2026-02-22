"use strict";
/**
 * ISentimentAnalyzer.ts
 * ---------------------
 * Contract for any sentiment analysis implementation.
 *
 * Design Decision:
 * We use an interface so we can swap the Bag-of-Words engine
 * with an ML-based one later without touching the rest of the codebase.
 * This follows the Dependency Inversion Principle (SOLID "D").
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=ISentimentAnalyzer.js.map