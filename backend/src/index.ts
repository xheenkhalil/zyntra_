import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import cacheService from './services/cacheService'; // Initialize cache service early
import './queues/emailQueue'; // Initialize BullMQ email worker early
import { errorHandler } from './middleware/errorMiddleware';

// === Route Imports ===
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
import systemRoutes from './routes/systemRoutes';
import proctoringRoutes from './routes/proctoringRoutes';
import aiRoutes from './routes/aiRoutes';

// Swagger Imports
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';

const app = express();
const PORT = config.PORT;

// =====================================================
// SECURITY MIDDLEWARE (HELMET) & PERFORMANCE
// =====================================================
app.use(helmet());
app.use(compression()); // Gzip compression

// Global Rate Limiting (1000 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// STRICT limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});

// =====================================================
// CORS CONFIGURATION
// =====================================================
const allowedOrigins: string[] = [
  'https://zyntraexams.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
];

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg = `CORS Policy: Access denied for origin ${origin}`;
        logger.warn(msg);
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  }),
);

// =====================================================
//  MIDDLEWARE SETUP
// =====================================================
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =====================================================
// SWAGGER API DOCS
// =====================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);

// =====================================================
// ROUTES
// =====================================================
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/superadmin/guest-quizzes', superAdminGuestQuizRoutes);
app.use('/api/centraladmin', centralAdminRoutes);
app.use('/api/courseadmin', courseAdminRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', guestRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/ai', aiRoutes);

// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'ZyntraExams Backend Running Successfully ',
    allowedOrigins,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================
app.use(errorHandler);

// =====================================================
// SERVER START
// =====================================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`✅ Backend server is running on port ${PORT}`);
    logger.info(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
    logger.info(`🔗 API base URL: https://zyntraexams.onrender.com/api`);
  });
}

export default app;
