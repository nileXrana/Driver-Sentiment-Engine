/**
 * IDriverService.ts
 * -----------------
 * Contract for all driver-related business operations.
 * 
 * The controller only depends on this interface, never on
 * the concrete service class. This makes unit testing trivial
 * because we can inject a mock implementation.
 */

import { DriverDocument } from "../types/model.types";

export interface IDriverService {
  /**
   * Update a driver's rolling average score.
   * Uses incremental formula: newAvg = (totalScore + newScore) / (totalFeedback + 1)
   * This avoids re-reading all past feedback from the database.
   */
  updateDriverScore(driverId: string, newSentimentScore: number): Promise<DriverDocument>;

  /** Retrieve a single driver by their unique ID */
  getDriverById(driverId: string): Promise<DriverDocument | null>;

  /** Retrieve all drivers (for the admin dashboard) */
  getAllDrivers(): Promise<DriverDocument[]>;

  /** Create a new driver record if one doesn't exist yet */
  findOrCreateDriver(driverId: string, name: string): Promise<DriverDocument>;
}
