import express from "express";
import auth from "../middleware/auth.middleware.js";

/* ================= CONTROLLERS ================= */
import {
  admitStudent,
  getAdmissionList,
  updateStudent,
  deleteStudent,
  exportAdmissionExcel,
  exportAdmissionPDF,

  // STUDENT SIDE
  getStudentProfile,
  getStudentAttendance,
  getStudentFees,
  getStudentAssignments,
  getStudentTimetable,
} from "../controllers/student.controller.js";

const router = express.Router();

/* =================================================
   ADMIN ROUTES
================================================= */

// ➕ Admit student
router.post("/admission", auth(["admin"]), admitStudent);

// 📋 Admission list
router.get("/admission-list", auth(["admin"]), getAdmissionList);

// ✏️ Update student
router.put("/:id", auth(["admin"]), updateStudent);

// ❌ Delete student
router.delete("/:id", auth(["admin"]), deleteStudent);

// 📤 Export
router.get("/export/excel", auth(["admin"]), exportAdmissionExcel);
router.get("/export/pdf", auth(["admin"]), exportAdmissionPDF);

/* =================================================
   STUDENT ROUTES
================================================= */

// 👤 Student profile
router.get("/profile", auth(["student"]), getStudentProfile);

// 📅 Attendance
router.get("/attendance", auth(["student"]), getStudentAttendance);

// 💰 Fees + payment history
router.get("/fees", auth(["student"]), getStudentFees);

// 📚 Assignments
router.get("/assignments", auth(["student"]), getStudentAssignments);

// 🗓️ Timetable
router.get("/timetable", auth(["student"]), getStudentTimetable);

export default router;
