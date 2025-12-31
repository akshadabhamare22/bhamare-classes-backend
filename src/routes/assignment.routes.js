import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  uploadAssignment,
  uploadSubmission,
} from "../middleware/upload.middleware.js";
import {
  addAssignment,
  getAssignmentsForStudent,
  submitAssignment,
} from "../controllers/assignment.controller.js";

const router = express.Router();

/* ================= TEACHER ================= */
router.post(
  "/upload",
  auth(["teacher"]),
  uploadAssignment.single("file"),
  addAssignment
);

/* ================= STUDENT ================= */
router.get(
  "/student",
  auth(["student"]),
  getAssignmentsForStudent
);

router.post(
  "/submit",
  auth(["student"]),
  uploadSubmission.single("file"),
  submitAssignment
);

export default router;
