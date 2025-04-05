import ClassModel from "../models/Class.js";
import ClassworkModel from "../models/Classwork.js";
import StudentsModel from "../models/students.js";
import path from "path";
import fs from "fs";



const CreateClass = async (req, res) => {
  try {
    const { ClassName } = req.body;
    if (!ClassName) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    const NewClass = await ClassModel.create({ ClassName });
    return res.status(201).json({
      message: "Class created successfully",
      class: NewClass,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const getclass = await ClassModel.find();
    if (!getclass) {
      return res.status(400).json({
        success: false,
        message: "No post Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Class displayed successfully",
      getclass,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "Internal server occured",
    });
  }
};
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await ClassModel.findById(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Class data retrieved successfully",
      classData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getStudentsClasses = async (req, res) => {
  try {
    const { email } = req.params;
    const studentRecords = await StudentsModel.find({ email });

    if (!studentRecords.length) {
      return res.status(404).json({
        success: false,
        message: "No classes found for this student",
      });
    }
    const classIds = studentRecords.map((student) => student.ClassId);

    if (!classIds.length) {
      return res.status(404).json({
        success: false,
        message: "No class IDs found for this student",
      });
    }

    const studentClasses = await ClassModel.find({ _id: { $in: classIds } });
    return res.status(200).json({
      success: true,
      message: "Student's classes retrieved successfully",
      classes: studentClasses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const archiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classToArchive = await ClassModel.findById(id);
    if (!classToArchive) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    classToArchive.isArchived = true;
    await classToArchive.save();

    return res.status(200).json({
      success: true,
      message: "Class archived successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const unarchiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classToUnarchive = await ClassModel.findById(id);
    if (!classToUnarchive) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    classToUnarchive.isArchived = false;
    await classToUnarchive.save();

    return res.status(200).json({
      success: true,
      message: "Class unarchived successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getArchivedClasses = async (req, res) => {
  try {
    const archivedClasses = await ClassModel.find({ isArchived: true });
    if (!archivedClasses || archivedClasses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No archived classes found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Archived classes retrieved successfully",
      archivedClasses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const editClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { ClassName } = req.body;

    if (!ClassName) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    const updatedClass = await ClassModel.findByIdAndUpdate(
      id,
      { ClassName },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classToDelete = await ClassModel.findById(id);
    if (!classToDelete) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    await ClassModel.findByIdAndDelete(id);

    await StudentsModel.updateMany({ ClassId: id }, { $pull: { ClassId: id } });

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const uploadClasswork = async (req, res) => {
  try {
    console.log("Upload request body:", req.body);
    console.log("Upload file:", req.file);

    const { title, classId } = req.body;
    if (!req.file || !title || !classId) {
      console.log("Missing required fields:", {
        file: !!req.file,
        title: !!title,
        classId: !!classId,
      });
      return res.status(400).json({
        success: false,
        message: "Title, file, and classId are required",
      });
    }

    const classwork = {
      title,
      classId,
      filename: req.file.filename,
      filePath: req.file.path,
      uploadDate: new Date(),
    };

    console.log("Creating classwork with:", classwork);
    const newClasswork = await ClassworkModel.create(classwork);

    return res.status(201).json({
      success: true,
      message: "Classwork uploaded successfully",
      classwork: newClasswork,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getClassworks = async (req, res) => {
  try {
    const { id } = req.params; // classId
    const classworks = await ClassworkModel.find({ classId: id });
    return res.status(200).json({
      success: true,
      classworks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteClasswork = async (req, res) => {
  try {
    const { id } = req.params;
    const classwork = await ClassworkModel.findByIdAndDelete(id);
    if (!classwork) {
      return res.status(404).json({
        success: false,
        message: "Classwork not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Classwork deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const editClasswork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const updatedClasswork = await ClassworkModel.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedClasswork) {
      return res.status(404).json({
        success: false,
        message: "Classwork not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Classwork updated successfully",
      classwork: updatedClasswork,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const downloadClasswork = async (req, res) => {
    try {
      const { id } = req.params;
      const classwork = await ClassworkModel.findById(id);
  
      if (!classwork) {
        return res.status(404).json({
          success: false,
          message: "Classwork not found",
        });
      }
  
      const filePath = path.join(path.resolve(), "public/images", classwork.filename);
    //   console.log("Attempting to download:", filePath);
  
      if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return res.status(404).json({ success: false, message: "File not found" });
      }
  
      // Send the file
      return res.download(filePath, classwork.filename);
    } catch (error) {
      console.error("Error sending file:", error);
      return res.status(500).json({
        success: false,
        message: "Error downloading file",
      });
    }
  };
  

export {
  CreateClass,
  getClasses,
  getClassById,
  getStudentsClasses,
  archiveClass,
  editClass,
  deleteClass,
  unarchiveClass,
  getArchivedClasses,
  uploadClasswork,
  getClassworks,
  deleteClasswork,
  editClasswork,
  downloadClasswork,
};
