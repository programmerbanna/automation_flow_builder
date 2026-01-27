import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("mongodb uri is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`MongoDB Connection Error: ${errorMessage}`);
    process.exit(1);
  }
};

export default connectDB;
