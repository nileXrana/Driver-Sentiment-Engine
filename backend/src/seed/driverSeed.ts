/**
 * driverSeed.ts
 * --------------
 * Seeds the Driver collection with a fixed set of known drivers.
 *
 * Design:
 * - Uses `upsert` (insert if not found, skip if already exists) so it is
 *   safe to call on every server startup without creating duplicates.
 * - Only seeds `driverId` and `name` — scores start at 0 and grow naturally.
 */

import { DriverModel } from "../models/Driver.model";

// ─── Known driver roster ─────────────────────────────────────────────────────
const DRIVER_SEED_DATA: { driverId: string; name: string }[] = [
  { driverId: "DRV001", name: "Rajesh Kumar" },
  { driverId: "DRV002", name: "Sahil Singh" },
  { driverId: "DRV003", name: "Priya Sharma" },
  { driverId: "DRV004", name: "Amit Verma" },
  { driverId: "DRV005", name: "Neha Gupta" },
  { driverId: "DRV006", name: "Rohan Mehta" },
  { driverId: "DRV007", name: "Sunita Patel" },
  { driverId: "DRV008", name: "Vikram Nair" },
  { driverId: "DRV009", name: "Anita Joshi" },
  { driverId: "DRV010", name: "Deepak Rao" },
];

/**
 * Seeds the drivers collection.
 * Safe to call on every boot — uses upsert so existing records are untouched.
 */
export async function seedDrivers(): Promise<void> {
  let inserted = 0;

  for (const { driverId, name } of DRIVER_SEED_DATA) {
    const result = await DriverModel.updateOne(
      { driverId },
      {
        $set: { name },                    // always sync the name from seed data
        $setOnInsert: { driverId, totalScore: 0, totalFeedback: 0, averageScore: 0, riskLevel: "LOW" },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted++;
    }
  }

  if (inserted > 0) {
    console.log(`[Seed] Inserted ${inserted} new drivers into the database.`);
  } else {
    console.log(`[Seed] All ${DRIVER_SEED_DATA.length} drivers already exist — no changes made.`);
  }
}
