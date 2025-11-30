"use strict";
// /backend/src/middleware/authMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../services/db"));
const config_1 = __importDefault(require("../config"));
// Middleware to check if a user is authenticated
const protect = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token)
        return res.status(401).json({ message: 'Not authorized, no token' });
    try {
        // Check blacklist
        const blacklistCheck = await db_1.default.query('SELECT token FROM token_blacklist WHERE token = $1', [token]);
        if (blacklistCheck.rows.length > 0) {
            return res.status(401).json({ message: 'Not authorized, token revoked' });
        }
        if (!config_1.default.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        // Attach user payload to the request object
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
exports.protect = protect;
// Reusable middleware to authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
        }
        next();
    };
};
exports.authorize = authorize;
