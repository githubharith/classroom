import express from "express";
import { getAttendance } from "../controllers/attendance.js";

const AttendanceRoutes=express.Router()

AttendanceRoutes.get('/getattendance',getAttendance)

export default AttendanceRoutes