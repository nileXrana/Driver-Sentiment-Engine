/**
 * Alert.model.ts
 * ---------------
 * Mongoose schema for driver performance alerts.
 *
 * Alerts are created when a driver's rolling average drops
 * below the configured threshold. We store each alert for
 * audit trail purposes.
 */
import { AlertDocument } from "../types/model.types";
export declare const AlertModel: import("mongoose").Model<AlertDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, AlertDocument, {}, {}> & AlertDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Alert.model.d.ts.map