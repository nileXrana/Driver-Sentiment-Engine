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
export declare class Database {
    private static instance;
    private isConnected;
    /** Private constructor prevents direct instantiation (Singleton) */
    private constructor();
    /** Get the single Database instance */
    static getInstance(): Database;
    /**
     * Connect to MongoDB with retry logic.
     * In production, the initial connection attempt might fail if the
     * database is still spinning up, so we retry a few times.
     */
    connect(uri: string): Promise<void>;
    /** Gracefully close the connection (used in shutdown hooks) */
    disconnect(): Promise<void>;
    /** Simple sleep utility - avoids pulling in a whole library */
    private sleep;
}
//# sourceMappingURL=Database.d.ts.map