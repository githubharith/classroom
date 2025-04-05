import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  Register: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  profile: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  googleId: { // Add this field for Google OAuth
    type: String,
  }
}, { timestamps: true });

const UserModel = mongoose.model("Users", UserSchema);

export default UserModel;