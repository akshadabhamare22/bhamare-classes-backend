import express from "express";
import { adminStats, totalRevenue, monthlyRevenue } from "../controllers/dashboard.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/admin", auth(["admin"]), adminStats);
router.get("/revenue", auth(["admin"]), totalRevenue);
router.get("/monthly-revenue", auth(["admin"]), monthlyRevenue);

export default router;
