import mongoose from "mongoose";

async function DBconnection(): Promise<void> {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error("MONGO_URL is missing from environment variables");
    }

    await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 5000,
    });

    console.log("Mongo connected successfully...");
}

export default DBconnection;