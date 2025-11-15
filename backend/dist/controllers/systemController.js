"use strict";
// backend/src/controllers/systemController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStatus = void 0;
const db_1 = __importDefault(require("../services/db")); // Your database service
/**
 * Checks the status of all core system components.
 * This is a secure endpoint intended for Superadmins.
 */
const getSystemStatus = async (req, res) => {
    // We can get the user's role from the request, added by authMiddleware
    // Although `authorize` middleware already checked it, we have access to it.
    // const superAdminId = req.user?.userId;
    let dbStatus = 'Offline';
    let dbLatency = null;
    // 1. Check Database Connection
    const startTime = process.hrtime.bigint(); // Start high-resolution timer
    try {
        // 'SELECT 1' is the fastest, lightest query to check DB liveness.
        await db_1.default.query('SELECT 1;');
        // If we get here, the query was successful
        dbStatus = 'Operational';
        // Calculate latency
        const endTime = process.hrtime.bigint();
        const latencyMs = Number(endTime - startTime) / 1000000; // Convert nanoseconds to ms
        dbLatency = `${latencyMs.toFixed(2)} ms`;
    }
    catch (dbError) {
        console.error("System Status DB Check FAILED:", dbError.message);
        dbStatus = 'Error';
        dbLatency = null;
    }
    // 2. Check Other Services
    // For now, we mock these. In the future, you could ping their health endpoints.
    const apiStatus = dbStatus === 'Operational' ? 'Operational' : 'Degraded';
    const proctoringStatus = 'Operational'; // Mock status
    const paymentStatus = 'Maintenance'; // Mock status from your HTML
    const emailStatus = 'Operational'; // Mock status
    const storageStatus = 'Operational'; // Mock status
    // 3. Compile Full Status Report
    // This JSON structure matches the needs of your new dashboard.
    const statusReport = {
        // For the "System Status Overview" cards
        overview: {
            webServer: {
                status: apiStatus,
                uptime: '99.98%', // This is usually tracked by your host (Vercel)
                responseTime: dbLatency, // We can use DB latency as a proxy
            },
            database: {
                status: dbStatus,
                connections: '47/100', // You'd get this from a more complex query if needed
                queryTime: dbLatency,
            },
            api: {
                status: paymentStatus, // Using payment status for the "API" card from your HTML
                endpoints: '12/15 Active', // Mock
            },
            aiProctoring: {
                status: proctoringStatus,
                activeSessions: 234, // Mock
            },
        },
        // For the "Detailed Service Status" list
        services: {
            authentication: {
                name: 'Authentication Service',
                status: 'Operational',
                uptime: '99.9%',
            },
            examEngine: {
                name: 'Exam Engine',
                status: 'Operational',
                uptime: '99.8%',
            },
            paymentGateway: {
                name: 'Payment Gateway',
                status: 'Maintenance',
                details: 'Scheduled until 3:00 PM',
            },
            emailService: {
                name: 'Email Service',
                status: 'Operational',
                uptime: '99.7%',
            },
            fileStorage: {
                name: 'File Storage',
                status: 'Operational',
                uptime: '99.9%',
            },
        },
        lastUpdated: new Date().toISOString(),
    };
    // If the database is down, the whole API is compromised.
    // Send a 503 (Service Unavailable) status.
    if (dbStatus !== 'Operational') {
        return res.status(503).json(statusReport);
    }
    // If all is well (or just mocks are running), send 200 OK.
    return res.status(200).json(statusReport);
};
exports.getSystemStatus = getSystemStatus;
