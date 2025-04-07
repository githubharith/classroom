import UserModel from "../models/user.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

const Register = async (req, res) => {
  try {
    const { Register, email, password } = req.body;
    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      return res.status(409).json({
        success: false, // Fixed string "false" to boolean
        message: "User Already Exist",
      });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10); // Fixed typo: hasepassword
    const NewUser = new UserModel({ // Fixed await on instantiation
      Register, // Still included for regular registration
      email,
      password: hashedPassword,
    });
    await NewUser.save();
    return res.status(201).json({
      success: true,
      message: "User Registered successfully",
      user: NewUser,
    });
  } catch (error) {
    console.log('Register error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error", // Fixed message
    });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const FindUser = await UserModel.findOne({ email });
    if (!FindUser) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
    const comparePassword = await bcryptjs.compare(password, FindUser.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Token includes id and email (Register optional)
    const token = jwt.sign(
      { id: FindUser._id, email: FindUser.email }, // Changed from Register to email
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Added expiration for consistency with googleLogin
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { email: FindUser.email }, // Return email instead of full user object
      token,
    });
  } catch (error) {
    console.log('Login error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const Logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// In your auth controller
const getUsers = async (req, res) => {
    try {
      // Debugging logs
    //   console.log('Authorization header:', req.headers.authorization);
    //   console.log('Authenticated user:', req.user);
  
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No user ID found in token",
        });
      }
  
      const user = await UserModel.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('getUsers error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body; // Changed from token to idToken

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    const ticket = await client.verifyIdToken({
       idToken,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let role = 'user';
    const charBeforeAt = email.charAt(email.indexOf('@') - 1);
    if (/[a-zA-Z]/.test(charBeforeAt)) {
      role = 'admin';
    } else if (/[0-9]/.test(charBeforeAt)) {
      role = 'user';
    }

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({
        googleId,
        email,
        name,
        role,
      });
      await user.save();
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Added email for consistency
      process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    );
    // console.log('Generated token at:', currentTime);
    // console.log('Token:', jwtToken);

    const redirectUrl = role === 'admin' ? '/admin' : '/home';
    res.status(200).json({
      success: true,
      message: "Google Login successful",
      user: { email: user.email, role: user.role }, // Return email instead of full user
      token: jwtToken,
      redirectUrl,
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message // Only in development
    });
  }
};

export { Register, Login, Logout, getUsers, googleLogin };