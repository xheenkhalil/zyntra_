// backend/src/middleware/errorMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error using Winston instead of console.error
  if (err.isOperational) {
    logger.warn(`[${req.method}] ${req.originalUrl} - Operational Error: ${err.message}`);
  } else {
    logger.error(`[${req.method}] ${req.originalUrl} - Unexpected Error:`, err);
  }

  // Handle specific database or library errors here if needed
  // Example: PostgreSQL unique violation
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Send structured response
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Only include stack in dev
  });
};
