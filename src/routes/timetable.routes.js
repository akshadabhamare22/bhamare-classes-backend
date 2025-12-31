import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  addTimetable,
  getStudentTimetable,
  getTeacherTimetable,
} from "../controllers/timetable.controller.js";

const router = express.Router();

router.post("/", auth(["admin"]), addTimetable);
router.get("/student", auth(["student"]), getStudentTimetable);
router.get("/teacher", auth(["teacher"]), getTeacherTimetable);

export default router;
