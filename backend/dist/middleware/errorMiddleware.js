"use strict";
// backend/src/middleware/errorMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error using Winston instead of console.error
    if (err.isOperational) {
        logger_1.default.warn(`[${req.method}] ${req.originalUrl} - Operational Error: ${err.message}`);
    }
    else {
        logger_1.default.error(`[${req.method}] ${req.originalUrl} - Unexpected Error:`, err);
    }
    // Handle specific database or library errors here if needed
    // Example: PostgreSQL unique violation
    if (err.code === '23505') {
        const message = 'Duplicate field value entered';
        error = new AppError_1.default(message, 400);
    }
    // Send structured response
    res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Only include stack in dev
    });
};
exports.errorHandler = errorHandler;
