import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB!!');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err.message);
        process.exit(1);
    }
}

export default connectDB;