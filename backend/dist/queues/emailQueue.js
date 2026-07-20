"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const emailService = __importStar(require("../services/emailService"));
const REDIS_URL = process.env.REDIS_URL || '';
// Connection for BullMQ
const connection = REDIS_URL
    ? new ioredis_1.default(REDIS_URL, {
        maxRetriesPerRequest: null, // Required by BullMQ
    })
    : null;
exports.emailQueue = connection ? new bullmq_1.Queue('email-queue', { connection }) : null;
// Worker to process email jobs
if (connection) {
    const worker = new bullmq_1.Worker('email-queue', async (job) => {
        const { type, payload } = job.data;
        console.log(`[EmailWorker] Processing job ${job.id} of type ${type}...`);
        try {
            if (type === 'sendStudentEmail') {
                const { email, fullName, studentCode, organizationName } = payload;
                await emailService.sendStudentCredentials(email, fullName, studentCode, organizationName);
                console.log(`[EmailWorker] Successfully sent student credentials to ${email}`);
            }
            else if (type === 'sendAdminInviteEmail') {
                const { email, fullName, inviteLink, organizationName } = payload;
                await emailService.sendAdminInviteEmail(email, fullName, inviteLink, organizationName);
                console.log(`[EmailWorker] Successfully sent admin invite to ${email}`);
            }
            else if (type === 'sendWelcomeEmail') {
                const { email, fullName, role } = payload;
                await emailService.sendWelcomeEmail(email, fullName, role);
                console.log(`[EmailWorker] Successfully sent welcome email to ${email}`);
            }
            else {
                console.warn(`[EmailWorker] Unknown job type: ${type}`);
            }
        }
        catch (error) {
            console.error(`[EmailWorker] Error processing job ${job.id}:`, error);
            throw error; // Rethrow to trigger BullMQ retries
        }
    }, {
        connection,
        concurrency: 5, // Process up to 5 emails concurrently
    });
    worker.on('failed', (job, err) => {
        if (job) {
            console.error(`[EmailWorker] Job ${job.id} failed with error: ${err.message}`);
        }
    });
    console.log('✅ Email Worker started successfully.');
}
else {
    console.warn('⚠️ No REDIS_URL found. Email background worker is disabled. Emails will not be queued.');
}
