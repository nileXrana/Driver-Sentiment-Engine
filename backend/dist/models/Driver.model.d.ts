/**
 * Driver.model.ts
 * ----------------
 * Mongoose schema and model for the Driver collection.
 *
 * Key Design:
 * - totalScore and totalFeedback enable O(1) rolling average updates.
 * - riskLevel is derived from averageScore for quick dashboard queries.
 */
import { DriverDocument } from "../types/model.types";
export declare const DriverModel: import("mongoose").Model<DriverDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & DriverDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Driver.model.d.ts.map