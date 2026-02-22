"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function dropDrivers() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    console.log("Connecting to Database...");
    await mongoose_1.default.connect(uri);
    try {
        console.log("Dropping drivers collection...");
        await mongoose_1.default.connection.collection("drivers").drop();
        console.log("Successfully dropped drivers collection.");
    }
    catch (error) {
        if (error.code === 26) {
            console.log("Collection does not exist - moving on.");
        }
        else {
            console.error("Error dropping collection:", error);
        }
    }
    await mongoose_1.default.disconnect();
    console.log("Disconnected.");
}
dropDrivers();
//# sourceMappingURL=dropDrivers.js.map