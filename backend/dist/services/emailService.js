"use strict";
// /backend/src/services/emailService.ts
// Uses Brevo (formerly Sendinblue) transactional email API
// No SDK needed — uses native fetch with Brevo's REST API
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminInviteEmail = exports.sendStudentCredentials = exports.sendEmail = void 0;
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'support@zyntra.io';
const EMAIL_NAME = process.env.EMAIL_NAME || 'ZYNTRA';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://zyntraexams.vercel.app';
/**
 * Send an email via the Brevo transactional email API.
 */
const sendEmail = async (to, subject, html) => {
    if (!BREVO_API_KEY) {
        console.warn('[EmailService] BREVO_API_KEY not set — skipping email send.');
        return null;
    }
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: EMAIL_NAME, email: EMAIL_FROM },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error(`[EmailService] Brevo API error (${response.status}):`, data);
            return null;
        }
        console.log(`[EmailService] Email sent to ${to}:`, data);
        return data;
    }
    catch (error) {
        console.error(`[EmailService] Failed to send email to ${to}:`, error);
        return null;
    }
};
exports.sendEmail = sendEmail;
/**
 * Send student login credentials (Student ID + login link).
 */
const sendStudentCredentials = async (email, fullName, studentId) => {
    const loginUrl = `${FRONTEND_URL}/login`;
    const subject = 'Welcome to ZYNTRA — Your Student Login Credentials';
    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #111A50; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #F5B841; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">ZYNTRA</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">AI-Powered Examination Platform</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111A50; margin: 0 0 15px; font-size: 20px;">Welcome, ${fullName}!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
          You have been registered as a student on ZYNTRA. Use the credentials below to log in and take your exams.
        </p>

        <!-- Credentials Box -->
        <div style="background: #f8f9fa; border: 2px solid #111A50; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #6b7280; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Student ID</p>
          <p style="color: #111A50; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 2px;">${studentId}</p>
        </div>

        <!-- Login Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: #111A50; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Log In Now</a>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin: 20px 0 0;">
          Or visit: <a href="${loginUrl}" style="color: #111A50;">${loginUrl}</a>
        </p>

        <!-- Divider -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
          If you did not expect this email, please ignore it. This email was sent by ZYNTRA on behalf of your institution.
        </p>
      </div>
    </div>
  `;
    return (0, exports.sendEmail)(email, subject, html);
};
exports.sendStudentCredentials = sendStudentCredentials;
/**
 * Send admin/teacher invite email with account setup link.
 */
const sendAdminInviteEmail = async (email, fullName, inviteLink) => {
    const subject = 'You\'re Invited to ZYNTRA — Set Up Your Account';
    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #111A50; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #F5B841; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">ZYNTRA</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">AI-Powered Examination Platform</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111A50; margin: 0 0 15px; font-size: 20px;">Hello, ${fullName}!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 10px;">
          You have been invited to join <strong>ZYNTRA</strong> as an administrator for your organisation.
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
          Click the button below to set up your password and complete your account registration. This link expires in <strong>24 hours</strong>.
        </p>

        <!-- Setup Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #111A50; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Set Up My Account</a>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin: 20px 0 5px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; font-size: 13px; margin: 0 0 20px;">
          <a href="${inviteLink}" style="color: #111A50;">${inviteLink}</a>
        </p>

        <!-- What's next -->
        <div style="background: #f0f4ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #111A50; font-weight: 600; margin: 0 0 8px; font-size: 14px;">What happens next?</p>
          <ul style="color: #4b5563; font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.8;">
            <li>Set your secure password</li>
            <li>Access your admin dashboard</li>
            <li>Start creating exams and managing students</li>
          </ul>
        </div>

        <!-- Divider -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
          If you did not expect this invitation, please ignore this email. The link will expire automatically.
        </p>
      </div>
    </div>
  `;
    return (0, exports.sendEmail)(email, subject, html);
};
exports.sendAdminInviteEmail = sendAdminInviteEmail;
