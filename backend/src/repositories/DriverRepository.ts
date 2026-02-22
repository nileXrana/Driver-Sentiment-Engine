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

import { DriverModel } from "../models/Driver.model";
import { DriverDocument } from "../types/model.types";

export class DriverRepository {
  /**
   * Find a driver by their business ID (not MongoDB's _id).
   * Returns null if the driver doesn't exist yet.
   */
  public async findByDriverId(driverId: string): Promise<DriverDocument | null> {
    try {
      return await DriverModel.findOne({ driverId });
    } catch (error) {
      console.error(`[DriverRepository] Error finding driver '${driverId}':`, error);
      throw error;
    }
  }

  /** Retrieve all drivers, sorted by average score ascending (worst first) */
  public async findAll(): Promise<DriverDocument[]> {
    try {
      return await DriverModel.find().sort({ averageScore: 1 });
    } catch (error) {
      console.error("[DriverRepository] Error fetching all drivers:", error);
      throw error;
    }
  }

  /** Create a new driver record */
  public async create(driverId: string, name: string): Promise<DriverDocument> {
    try {
      const driver = new DriverModel({
        driverId,
        name,
        totalScore: 0,
        totalFeedback: 0,
        averageScore: 0,
        riskLevel: "LOW",
      });
      return await driver.save();
    } catch (error) {
      console.error(`[DriverRepository] Error creating driver '${driverId}':`, error);
      throw error;
    }
  }

  /**
   * Atomic update of a driver's score.
   * This is much safer than reading the driver, computing, and saving it back,
   * which can cause race conditions if multiple feedbacks arrive simultaneously.
   */
  public async updateScoreAtomically(
    driverId: string,
    newScore: number,
    newAverageScore: number,
    newRiskLevel: string
  ): Promise<DriverDocument | null> {
    try {
      return await DriverModel.findOneAndUpdate(
        { driverId },
        {
          $inc: { totalScore: newScore, totalFeedback: 1 },
          $set: {
            averageScore: newAverageScore,
            riskLevel: newRiskLevel,
          },
        },
        { new: true } // Return the updated document
      );
    } catch (error) {
      console.error(`[DriverRepository] Error updating score for '${driverId}':`, error);
      throw error;
    }
  }
}
