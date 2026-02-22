// Singleton pattern for the MongoDB connection.

import mongoose from "mongoose";

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  // Private constructor prevents direct instantiation
  private constructor() { }

  // Get the single Database instance
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Connect to MongoDB with retry logic
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

  // Gracefully close the connection
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("[Database] Disconnected from MongoDB.");
    }
  }

  // Simple sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
