import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongo_uri = process.env.MONGO_URI || "";
    const conn = await mongoose.connect(mongo_uri);
    console.log(`MongoDB Connected`);
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Database connection error: ${error.message}`);
    }
    process.exit(1); // Stop the application if connection fails
  }
};
export default connectDB