"use strict";
// backend/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config"));
const helmet_1 = __importDefault(require("helmet"));
// === Route Imports ===
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const superAdminRoutes_1 = __importDefault(require("./routes/superAdminRoutes"));
const centralAdminRoutes_1 = __importDefault(require("./routes/centralAdminRoutes"));
const courseAdminRoutes_1 = __importDefault(require("./routes/courseAdminRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const guestRoutes_1 = __importDefault(require("./routes/guestRoutes")); // Public routes
const superAdminGuestQuizRoutes_1 = __importDefault(require("./routes/superAdminGuestQuizRoutes")); // Admin-only routes
const systemRoutes_1 = __importDefault(require("./routes/systemRoutes"));
const app = (0, express_1.default)();
const PORT = config_1.default.PORT;
// =====================================================
//  SECURITY MIDDLEWARE (HELMET)
// =====================================================
app.use((0, helmet_1.default)());
// =====================================================
//  CORS CONFIGURATION
// =====================================================
const allowedOrigins = [
    "https://zyntraexams.vercel.app",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            const msg = `CORS Policy: Access denied for origin ${origin}`;
            console.error(msg);
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));
// =====================================================
//  MIDDLEWARE SETUP
// =====================================================
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// =====================================================
//  ROUTES
// =====================================================
app.use("/api/auth", authRoutes_1.default);
app.use("/api/superadmin", superAdminRoutes_1.default); // All superadmin routes
app.use("/api/superadmin/guest-quizzes", superAdminGuestQuizRoutes_1.default); // Guest quiz admin routes
app.use("/api/centraladmin", centralAdminRoutes_1.default);
app.use("/api/courseadmin", courseAdminRoutes_1.default);
app.use("/api/exams", examRoutes_1.default);
app.use("/api/questions", questionRoutes_1.default);
app.use("/api/student", studentRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/public", guestRoutes_1.default); // Public-facing routes (like taking guest quizzes)
app.use('/api/system', systemRoutes_1.default);
// =====================================================
//  HEALTH CHECK ENDPOINT
// =====================================================
app.get("/", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: "ZyntraExams Backend Running Successfully ",
        allowedOrigins,
    });
});
// =====================================================
//  ERROR HANDLER
// =====================================================
app.use((err, _req, res, _next) => {
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
