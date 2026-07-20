"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("./utils/logger"));
require("./queues/emailQueue"); // Initialize BullMQ email worker early
const errorMiddleware_1 = require("./middleware/errorMiddleware");
// === Route Imports ===
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const superAdminRoutes_1 = __importDefault(require("./routes/superAdminRoutes"));
const centralAdminRoutes_1 = __importDefault(require("./routes/centralAdminRoutes"));
const courseAdminRoutes_1 = __importDefault(require("./routes/courseAdminRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const guestRoutes_1 = __importDefault(require("./routes/guestRoutes"));
const superAdminGuestQuizRoutes_1 = __importDefault(require("./routes/superAdminGuestQuizRoutes"));
const systemRoutes_1 = __importDefault(require("./routes/systemRoutes"));
const proctoringRoutes_1 = __importDefault(require("./routes/proctoringRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const certificationRoutes_1 = __importDefault(require("./routes/certificationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// Swagger Imports
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger"));
const app = (0, express_1.default)();
const PORT = config_1.default.PORT;
// =====================================================
// SECURITY MIDDLEWARE (HELMET) & PERFORMANCE
// =====================================================
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)()); // Gzip compression
// Global Rate Limiting (1000 requests per 15 minutes)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
// STRICT limit for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again later.',
});
// =====================================================
// CORS CONFIGURATION
// =====================================================
const allowedOrigins = [
    'https://zyntraexams.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            const msg = `CORS Policy: Access denied for origin ${origin}`;
            logger_1.default.warn(msg);
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));
// =====================================================
//  MIDDLEWARE SETUP
// =====================================================
app.use(express_1.default.json({ limit: '50mb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// =====================================================
// SWAGGER API DOCS
// =====================================================
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes_1.default);
// =====================================================
// ROUTES
// =====================================================
app.use('/api/auth', authRoutes_1.default);
app.use('/api/superadmin', superAdminRoutes_1.default);
app.use('/api/superadmin/guest-quizzes', superAdminGuestQuizRoutes_1.default);
app.use('/api/centraladmin', centralAdminRoutes_1.default);
app.use('/api/courseadmin', courseAdminRoutes_1.default);
app.use('/api/exams', examRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
app.use('/api/student', studentRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/public', guestRoutes_1.default);
app.use('/api/system', systemRoutes_1.default);
app.use('/api/proctoring', proctoringRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/certifications', certificationRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'ZyntraExams Backend Running Successfully ',
        allowedOrigins,
    });
});
// =====================================================
// ERROR HANDLER
// =====================================================
app.use(errorMiddleware_1.errorHandler);
// =====================================================
// SERVER START
// =====================================================
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger_1.default.info(`✅ Backend server is running on port ${PORT}`);
        logger_1.default.info(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
        logger_1.default.info(`🔗 API base URL: https://zyntraexams.onrender.com/api`);
    });
}
exports.default = app;
