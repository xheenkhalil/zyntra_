// backend/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import helmet from "helmet";

// === Route Imports ===
import authRoutes from "./routes/authRoutes";
import superAdminRoutes from "./routes/superAdminRoutes";
import centralAdminRoutes from "./routes/centralAdminRoutes";
import courseAdminRoutes from "./routes/courseAdminRoutes";
import examRoutes from "./routes/examRoutes";
import questionRoutes from "./routes/questionRoutes";
import studentRoutes from "./routes/studentRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import guestRoutes from "./routes/guestRoutes"; // Public routes
import superAdminGuestQuizRoutes from "./routes/superAdminGuestQuizRoutes"; // Admin-only routes
import systemRoutes from './routes/systemRoutes';


const app = express();
const PORT = config.PORT;

// =====================================================
//  SECURITY MIDDLEWARE (HELMET)
// =====================================================
app.use(helmet());

// =====================================================
//  CORS CONFIGURATION
// =====================================================
const allowedOrigins: string[] = [
  "https://zyntraexams.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg = `CORS Policy: Access denied for origin ${origin}`;
        console.error(msg);
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  })
);

// =====================================================
//  MIDDLEWARE SETUP
// =====================================================
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// =====================================================
//  ROUTES
// =====================================================
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes); // All superadmin routes
app.use("/api/superadmin/guest-quizzes", superAdminGuestQuizRoutes); // Guest quiz admin routes
app.use("/api/centraladmin", centralAdminRoutes);
app.use("/api/courseadmin", courseAdminRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", guestRoutes); // Public-facing routes (like taking guest quizzes)
app.use('/api/system', systemRoutes); 

// =====================================================
//  HEALTH CHECK ENDPOINT
// =====================================================
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "ZyntraExams Backend Running Successfully ",
    allowedOrigins,
  });
});

// =====================================================
//  ERROR HANDLER
// =====================================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// =====================================================
//  SERVER START
// =====================================================
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log(`🔗 API base URL: https://zyntraexams.onrender.com/api`);
});