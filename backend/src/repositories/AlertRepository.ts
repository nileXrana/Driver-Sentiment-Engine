/**
 * AlertRepository.ts
 * -------------------
 * Data Access Layer for Alert documents.
 */

import { AlertModel } from "../models/Alert.model";
import { AlertDocument } from "../types/model.types";

export class AlertRepository {
  /** Create a new alert record */
  public async create(alertData: Partial<AlertDocument>): Promise<AlertDocument> {
    try {
      const alert = new AlertModel(alertData);
      return await alert.save();
    } catch (error) {
      console.error("[AlertRepository] Error creating alert:", error);
      throw error;
    }
  }

  /**
   * Find the most recent alert for a driver.
   * Used to check cooldown — if the last alert was too recent, we skip.
   */
  public async findLatestByDriverId(driverId: string): Promise<AlertDocument | null> {
    try {
      return await AlertModel.findOne({ driverId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error(`[AlertRepository] Error finding latest alert for '${driverId}':`, error);
      throw error;
    }
  }

  /** Get all alerts, optionally filtered by driver */
  public async findAll(driverId?: string): Promise<AlertDocument[]> {
    try {
      const filter = driverId ? { driverId } : {};
      return await AlertModel.find(filter).sort({ createdAt: -1 });
    } catch (error) {
      console.error("[AlertRepository] Error fetching alerts:", error);
      throw error;
    }
  }
}
