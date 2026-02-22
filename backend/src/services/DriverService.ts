// Driver score management

import { IDriverService } from "../interfaces";
import { DriverRepository } from "../repositories/DriverRepository";
import { DriverDocument } from "../types/model.types";

export class DriverService implements IDriverService {
  private readonly driverRepository: DriverRepository;


  constructor(driverRepository: DriverRepository) {
    this.driverRepository = driverRepository;
  }

  // Update a driver's rolling average
  public async updateDriverScore(driverId: string, newSentimentScore: number): Promise<DriverDocument> {
    try {
      // Step 1: Fetch the current driver record
      const driver = await this.driverRepository.findByDriverId(driverId);

      if (!driver) {
        throw new Error(`Driver '${driverId}' not found. Cannot update score.`);
      }

      // Step 2: Compute the new rolling average (O(1) operation)
      const newTotalScore = driver.totalScore + newSentimentScore;
      const newTotalFeedback = driver.totalFeedback + 1;
      const newAverageScore = Math.round((newTotalScore / newTotalFeedback) * 100) / 100;

      // Step 3: Derive risk level from the new average
      const newRiskLevel = this.classifyRiskLevel(newAverageScore);

      console.log(
        `[DriverService] Updating driver '${driverId}': ` +
        `score ${driver.averageScore} → ${newAverageScore} (${newRiskLevel})`
      );

      // Step 4: Persist atomically to the database
      const updatedDriver = await this.driverRepository.updateScoreAtomically(
        driverId,
        newSentimentScore,
        newAverageScore,
        newRiskLevel
      );

      if (!updatedDriver) {
        throw new Error(`Failed to update driver '${driverId}' — document not found during write.`);
      }

      return updatedDriver;
    } catch (error) {
      console.error(`[DriverService] Error updating score for '${driverId}':`, error);
      throw error;
    }
  }

  // Get single driver
  public async getDriverById(driverId: string): Promise<DriverDocument | null> {
    try {
      return await this.driverRepository.findByDriverId(driverId);
    } catch (error) {
      console.error(`[DriverService] Error getting driver '${driverId}':`, error);
      throw error;
    }
  }

  // Get all drivers
  public async getAllDrivers(): Promise<DriverDocument[]> {
    try {
      return await this.driverRepository.findAll();
    } catch (error) {
      console.error("[DriverService] Error getting all drivers:", error);
      throw error;
    }
  }

  // Find or create driver
  public async findOrCreateDriver(driverId: string, name: string): Promise<DriverDocument> {
    try {
      const existingDriver = await this.driverRepository.findByDriverId(driverId);

      if (existingDriver) {
        return existingDriver;
      }

      console.log(`[DriverService] Driver '${driverId}' not found. Creating new record.`);
      return await this.driverRepository.create(driverId, name);
    } catch (error) {
      console.error(`[DriverService] Error in findOrCreateDriver for '${driverId}':`, error);
      throw error;
    }
  }

  // Classify risk level (HIGH < 2.5, MEDIUM < 3.5, LOW >= 3.5)
  private classifyRiskLevel(averageScore: number): "LOW" | "MEDIUM" | "HIGH" {
    if (averageScore < 2.5) return "HIGH";
    if (averageScore < 3.5) return "MEDIUM";
    return "LOW";
  }
}
