import AttendanceModel from "../models/attendance.js";
import UserModel from "../models/user.js";

const getAttendance = async (req, res) => {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const attendance = await AttendanceModel.find({ classId });
    // if (!attendance) {
    //     return res.status(400).json({
    //         success:false,
    //         message:"No datas Found"

    //     })
    // }
    if (!attendance || attendance.length === 0) {
      return res.status(200).json({
        success: true,
        attendance: [],
        totalUsers: 0,
        presentCount: 0,
        absentCount: 0,
      });
    }
    // Get total number of users (assuming all users are potential attendees)
    const totalUsers = await UserModel.countDocuments({ role: "user" }); // Adjust this query based on your user model logic

    // Filter attendance for today
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance.filter((record) => {
      const recordDate = new Date(record.createdAt).toISOString().split("T")[0];
      return recordDate === today;
    });

    // Calculate present count
    const uniquePresentUsers = new Set(
        todayAttendance
          .filter((record) => record.status === "present")
          .map((record) => record.user)
      );
      const presentCount = uniquePresentUsers.size;

    // Calculate absent count
    const absentCount = totalUsers - presentCount;
    res.status(200).json({
      success: true,
      attendance: todayAttendance, // Return only today's attendance
      totalUsers,
      presentCount,
      absentCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getAttendance };
