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

app.use(cors());
app.use(express.json());

// static files
app.use("/uploads", express.static("uploads"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/teachers", teacherRoutes)
app.use("/api/revenue", revenueRoutes);

export default app;
