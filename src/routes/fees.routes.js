import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  setFees,
  addPayment,
  studentFees,
  studentPayments,
  adminFeesList,
} from "../controllers/fees.controller.js";

const router = express.Router();

/* ================= ADMIN ================= */
router.post("/set", auth(["admin"]), setFees);
router.post("/pay", auth(["admin"]), addPayment);
router.get("/admin/list", auth(["admin"]), adminFeesList);

/* ================= STUDENT ================= */
router.get("/student", auth(["student"]), studentFees);
router.get("/student/history", auth(["student"]), studentPayments);

export default router;
