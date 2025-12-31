import express from "express";
import auth from "../middleware/auth.middleware.js";
import { revenueSummary, monthlyRevenue } from "../controllers/revenue.controller.js";

const router = express.Router();

router.get("/summary", auth(["admin"]), revenueSummary);
router.get("/monthly", auth(["admin"]), monthlyRevenue);

export default router;
