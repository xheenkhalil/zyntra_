// /backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Extend the Express Request type to include our user payload
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        organizationId?: string; // Add organizationId
    }
}

// Middleware to check if a user is authenticated
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        if (!config.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
        
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        
        // Attach user payload to the request object
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId
        };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// NEW: Reusable middleware to authorize specific roles
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
        }
        next();
    };
};