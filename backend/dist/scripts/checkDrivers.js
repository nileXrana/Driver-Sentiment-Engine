"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Driver_model_1 = require("../models/Driver.model");
dotenv_1.default.config();
async function checkDrivers() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    await mongoose_1.default.connect(uri);
    const drivers = await Driver_model_1.DriverModel.find({});
    console.log(`Found ${drivers.length} drivers:`);
    console.dir(drivers, { depth: null });
    await mongoose_1.default.disconnect();
}
checkDrivers();
//# sourceMappingURL=checkDrivers.js.map