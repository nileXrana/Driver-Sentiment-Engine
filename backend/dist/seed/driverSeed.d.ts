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
/**
 * Seeds the drivers collection.
 * Safe to call on every boot — uses upsert so existing records are untouched.
 */
export declare function seedDrivers(): Promise<void>;
//# sourceMappingURL=driverSeed.d.ts.map