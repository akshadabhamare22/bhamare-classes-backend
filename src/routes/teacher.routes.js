import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  addTeacher,
  getTeachers,
  deleteTeacher,
  getTeacherProfile,
  updateTeacherProfile,
} from "../controllers/teacher.controller.js";

const router = express.Router();

/* ===============================
   ADMIN ROUTES
================================ */

// ➕ Add Teacher (Admin)
router.post(
  "/",
  auth(["admin"]),
  addTeacher
);

// 📋 Get All Teachers (Admin)
router.get(
  "/",
  auth(["admin"]),
  getTeachers
);

// ❌ Delete Teacher (Admin)
router.delete(
  "/:id",
  auth(["admin"]),
  deleteTeacher
);

/* ===============================
   TEACHER ROUTES
================================ */

// 👤 Get Logged-in Teacher Profile
router.get(
  "/profile",
  auth(["teacher"]),
  getTeacherProfile
);

// ✏️ Update Teacher Profile
router.put(
  "/profile",
  auth(["teacher"]),
  updateTeacherProfile
);

export default router;
