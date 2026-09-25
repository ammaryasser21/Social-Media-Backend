import mongoose from 'mongoose';

async function DBconnection() {
    try {
        await mongoose.connect(process.env.MONGO_URL as string, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Mongo connected successfully...")
    } catch (error) {
        console.log({ error })
    }

}

export default DBconnection;