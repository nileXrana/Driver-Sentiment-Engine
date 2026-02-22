/**
 * DriverRepository.ts
 * --------------------
 * Data Access Layer for Driver documents.
 *
 * Following the Repository Pattern (same as Spring Data JPA):
 * - Controllers never touch the database directly.
 * - Services call repository methods.
 * - Repositories encapsulate all Mongoose queries.
 *
 * This separation means if we ever switch from MongoDB to PostgreSQL,
 * only the repository layer needs to change.
 */
import { DriverDocument } from "../types/model.types";
export declare class DriverRepository {
    /**
     * Find a driver by their business ID (not MongoDB's _id).
     * Returns null if the driver doesn't exist yet.
     */
    findByDriverId(driverId: string): Promise<DriverDocument | null>;
    /** Retrieve all drivers, sorted by average score ascending (worst first) */
    findAll(): Promise<DriverDocument[]>;
    /** Create a new driver record */
    create(driverId: string, name: string): Promise<DriverDocument>;
    /**
     * Atomic update of a driver's score.
     * This is much safer than reading the driver, computing, and saving it back,
     * which can cause race conditions if multiple feedbacks arrive simultaneously.
     */
    updateScoreAtomically(driverId: string, newScore: number, newAverageScore: number, newRiskLevel: string): Promise<DriverDocument | null>;
}
//# sourceMappingURL=DriverRepository.d.ts.map