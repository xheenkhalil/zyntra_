"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config"));
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
const app = (0, express_1.default)();
const PORT = config_1.default.PORT;
app.use((0, cors_1.default)({ origin: 'http://localhost:5173', credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/superadmin', superAdminRoutes_1.default);
app.use('/api/centraladmin', centralAdminRoutes_1.default);
app.use('/api/courseadmin', courseAdminRoutes_1.default);
app.use('/api/exams', examRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
app.use('/api/student', studentRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/public', guestRoutes_1.default);
app.use('/api/superadmin/guest-quizzes', superAdminGuestQuizRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
