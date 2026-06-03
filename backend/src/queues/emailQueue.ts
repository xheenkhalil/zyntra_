import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import * as emailService from '../services/emailService';

const REDIS_URL = process.env.REDIS_URL || '';

// Connection for BullMQ
const connection = REDIS_URL ? new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
}) : null;

export const emailQueue = connection ? new Queue('email-queue', { connection }) : null;

// Worker to process email jobs
if (connection) {
    const worker = new Worker('email-queue', async (job: Job) => {
        const { type, payload } = job.data;

        console.log(`[EmailWorker] Processing job ${job.id} of type ${type}...`);

        try {
            if (type === 'sendStudentEmail') {
                const { email, fullName, studentCode } = payload;
                await emailService.sendStudentCredentials(email, fullName, studentCode);
                console.log(`[EmailWorker] Successfully sent student credentials to ${email}`);
            } else if (type === 'sendAdminInviteEmail') {
                const { email, fullName, inviteLink } = payload;
                await emailService.sendAdminInviteEmail(email, fullName, inviteLink);
                console.log(`[EmailWorker] Successfully sent admin invite to ${email}`);
            } else if (type === 'sendWelcomeEmail') {
                const { email, fullName, role } = payload;
                await emailService.sendWelcomeEmail(email, fullName, role);
                console.log(`[EmailWorker] Successfully sent welcome email to ${email}`);
            } else {
                console.warn(`[EmailWorker] Unknown job type: ${type}`);
            }
        } catch (error) {
            console.error(`[EmailWorker] Error processing job ${job.id}:`, error);
            throw error; // Rethrow to trigger BullMQ retries
        }
    }, { 
        connection,
        concurrency: 5 // Process up to 5 emails concurrently
    });

    worker.on('failed', (job, err) => {
        if (job) {
            console.error(`[EmailWorker] Job ${job.id} failed with error: ${err.message}`);
        }
    });

    console.log('✅ Email Worker started successfully.');
} else {
    console.warn('⚠️ No REDIS_URL found. Email background worker is disabled. Emails will not be queued.');
}
