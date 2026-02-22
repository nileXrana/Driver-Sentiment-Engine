import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function dropAlerts() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/driver-sentiment-engine";
    console.log("Connecting to Database...");
    await mongoose.connect(uri);

    try {
        console.log("Dropping alerts collection...");
        await mongoose.connection.collection("alerts").drop();
        console.log("Successfully dropped alerts collection.");
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

dropAlerts();
