"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const driverSeed_1 = require("../seed/driverSeed");
dotenv_1.default.config();
async function runSeed() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    await mongoose_1.default.connect(uri);
    await (0, driverSeed_1.seedDrivers)();
    await mongoose_1.default.disconnect();
}
runSeed();
//# sourceMappingURL=seedDb.js.map