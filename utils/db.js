import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const DBcon=async()=>{
     try {
        mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB is Connected")
     } catch (error) {
        console.log("MongoDB error",error)
     }

}

export default DBcon;