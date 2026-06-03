"use strict";
// backend/src/utils/AppError.ts
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom Error class that handles standard HTTP status codes and operational status.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
