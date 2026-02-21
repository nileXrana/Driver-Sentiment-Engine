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

import mongoose from "mongoose";

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  /** Private constructor prevents direct instantiation (Singleton) */
  private constructor() {}

  /** Get the single Database instance */
  public static getInstance(): Database {
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
  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log("[Database] Already connected, skipping.");
      return;
    }

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await mongoose.connect(uri);
        this.isConnected = true;
        console.log(`[Database] Connected to MongoDB on attempt ${attempt}.`);
        return;
      } catch (error) {
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
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("[Database] Disconnected from MongoDB.");
    }
  }

  /** Simple sleep utility - avoids pulling in a whole library */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
