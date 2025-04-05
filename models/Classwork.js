import mongoose from "mongoose";

const classworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class', // References the Class model
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const ClassworkModel = mongoose.model('Classwork', classworkSchema);
export default ClassworkModel;