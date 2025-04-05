import express from "express";
import { archiveClass, CreateClass, deleteClass, deleteClasswork, downloadClasswork, editClass, editClasswork, getArchivedClasses, getClassById, getClasses, getClassworks, getStudentsClasses, unarchiveClass, uploadClasswork } from "../controllers/Class.js";
import upload from "../middleware/Multer.js";

const ClassRoutes=express.Router()

ClassRoutes.post('/createclass',CreateClass)
ClassRoutes.get('/getclass',getClasses)
ClassRoutes.get('/getclass/:id', getClassById);
ClassRoutes.get('/studentclasses/:email',getStudentsClasses)
ClassRoutes.post('/archiveclass/:id', archiveClass);
ClassRoutes.post('/updateclass/:id', editClass);
ClassRoutes.post('/deleteclass/:id', deleteClass);
ClassRoutes.post('/unarchiveclass/:id', unarchiveClass);
ClassRoutes.get('/getarchived', getArchivedClasses);
ClassRoutes.post('/classwork/upload', upload.single('file'), uploadClasswork);
ClassRoutes.get('/classwork/:id', getClassworks);
ClassRoutes.post('/classwork/delete/:id', deleteClasswork);
ClassRoutes.post('/classwork/edit/:id', editClasswork);
ClassRoutes.get('/classwork/download/:id', downloadClasswork);


export default ClassRoutes