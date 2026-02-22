import mongoose from "mongoose";
import dotenv from "dotenv";
import { DriverModel } from "../models/Driver.model";

dotenv.config();

async function checkDrivers() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    await mongoose.connect(uri);

    const drivers = await DriverModel.find({});
    console.log(`Found ${drivers.length} drivers:`);
    console.dir(drivers, { depth: null });

    await mongoose.disconnect();
}

checkDrivers();
