import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function dropDrivers() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    console.log("Connecting to Database...");
    await mongoose.connect(uri);

    try {
        console.log("Dropping drivers collection...");
        await mongoose.connection.collection("drivers").drop();
        console.log("Successfully dropped drivers collection.");
    } catch (error: any) {
        if (error.code === 26) {
            console.log("Collection does not exist - moving on.");
        } else {
            console.error("Error dropping collection:", error);
        }
    }

    await mongoose.disconnect();
    console.log("Disconnected.");
}

dropDrivers();
