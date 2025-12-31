import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import feesRoutes from "./routes/fees.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import revenueRoutes from "./routes/revenue.routes.js";

const app = express();

/* ===============================
   ✅ CORS CONFIG (IMPORTANT)
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:5173",               // local frontend
      "https://bhamare-classes.netlify.app"  // live frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

/* ===============================
   BODY PARSERS
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   STATIC FILES
================================ */
app.use("/uploads", express.static("uploads"));

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/revenue", revenueRoutes);

export default app;
