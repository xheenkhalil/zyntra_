"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeExamSession = exports.analyzeImageFrame = exports.startExamSession = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const ZYNTRA_API_URL = config_1.default.ZYNTRA_API_URL;
const ZYNTRA_API_KEY = config_1.default.ZYNTRA_API_KEY;
const zyntraClient = axios_1.default.create({
    baseURL: ZYNTRA_API_URL,
    headers: {
        'X-API-Key': ZYNTRA_API_KEY,
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout
});
/**
 * Initializes a new proctored exam session context in Zyntra AI
 */
const startExamSession = async (examSessionId, studentEmail) => {
    try {
        const response = await zyntraClient.post('/session/init', {
            session_id: examSessionId,
            user_id: studentEmail,
        });
        console.log(`[Zyntra] Session initialized successfully: ${examSessionId}`);
        return response.data;
    }
    catch (error) {
        console.error('[Zyntra] Failed to initialize proctoring session:', error.response?.data || error.message);
        // Fail-open strategy: log and return null (resilient)
        return null;
    }
};
exports.startExamSession = startExamSession;
/**
 * Sends a captured webcam image frame to Zyntra AI for analysis
 */
const analyzeImageFrame = async (examSessionId, studentEmail, imageBase64) => {
    try {
        // Ensure image has the data URI scheme prefix
        const fullImageBase64 = imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`;
        const response = await zyntraClient.post('/analyze', {
            session_id: examSessionId,
            user_id: studentEmail,
            image_base64: fullImageBase64,
        });
        return response.data;
    }
    catch (error) {
        console.error('[Zyntra] Failed to analyze proctoring snapshot:', error.response?.data || error.message);
        // Fail-open strategy
        return null;
    }
};
exports.analyzeImageFrame = analyzeImageFrame;
/**
 * Finalizes and closes the proctored exam session on Zyntra AI, compiling the audit logs
 */
const closeExamSession = async (examSessionId) => {
    try {
        const response = await zyntraClient.post(`/session/end/${examSessionId}`);
        console.log(`[Zyntra] Session ended successfully: ${examSessionId}`);
        return response.data;
    }
    catch (error) {
        console.error('[Zyntra] Failed to end proctoring session:', error.response?.data || error.message);
        return null;
    }
};
exports.closeExamSession = closeExamSession;
