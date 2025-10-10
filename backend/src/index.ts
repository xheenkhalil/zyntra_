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

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

// API Routes
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


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});


