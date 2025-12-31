import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  markAttendance,
  getAttendanceByStudent,
  getAttendanceForAdmin,
  getStudentsByStandard,
} from "../controllers/attendance.controller.js";

const router = express.Router();

/* ================= TEACHER ================= */
router.post("/", auth(["teacher"]), markAttendance);
router.get("/teacher/students", auth(["teacher"]), getStudentsByStandard);

/* ================= STUDENT ================= */
router.get("/student", auth(["student"]), getAttendanceByStudent);

/* ================= ADMIN ================= */
router.get("/admin", auth(["admin"]), getAttendanceForAdmin);

export default router;
