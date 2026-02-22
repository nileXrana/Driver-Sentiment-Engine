import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDrivers } from "../seed/driverSeed";

dotenv.config();

async function runSeed() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    await mongoose.connect(uri);

    await seedDrivers();

    await mongoose.disconnect();
}

runSeed();
