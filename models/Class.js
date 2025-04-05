import mongoose from "mongoose";

const classSchema=new mongoose.Schema({
    ClassName:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
    },
    otpExpiresAt:{
        type:String,
    },
    isArchived: {
        type: Boolean,
        default: false,
      },
},{timestamps:true})

const ClassModel=mongoose.model('Class',classSchema)

export default ClassModel