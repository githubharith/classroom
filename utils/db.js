import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const DBcon=async()=>{
   try {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables!");
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB Connected Successfully");
    } catch (error) {
      console.error("MongoDB Connection Error:", error.message);
      process.exit(1); // Exit with failure
    }
}

export default DBcon;