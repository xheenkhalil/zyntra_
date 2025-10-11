import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import centralAdminRoutes from './routes/centralAdminRoutes';
import courseAdminRoutes from './routes/courseAdminRoutes';
import examRoutes from './routes/examRoutes';
import questionRoutes from './routes/questionRoutes';
import studentRoutes from './routes/studentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import guestRoutes from './routes/guestRoutes';
import superAdminGuestQuizRoutes from './routes/superAdminGuestQuizRoutes';

const app = express();
const PORT = config.PORT;

// --- DYNAMIC CORS CONFIGURATION FOR PRODUCTION ---
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []; 

app.use(cors({
    origin: (origin, callback) => {
        // In production, we strictly check origins.
        if (!origin) {
            console.warn('CORS: Request with no origin received. Potentially direct API call or non-browser client.');
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = `CORS Policy: Access denied for Origin: ${origin}. Not in allowed list: [${allowedOrigins.join(', ')}]`;
            console.error(msg);
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));
// --- END DYNAMIC CORS CONFIGURATION ---

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// API Routes - All prefixed with '/api'
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/centraladmin', centralAdminRoutes);
app.use('/api/courseadmin', courseAdminRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', guestRoutes);
app.use('/api/superadmin/guest-quizzes', superAdminGuestQuizRoutes);

// Server listening
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}.`);
    console.log(`Configured Allowed CORS origins: ${allowedOrigins.join(', ')}`);
    console.log(`API base URL: https://zyntraexams.onrender.com/api`);
});