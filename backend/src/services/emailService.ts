import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const data = await resend.emails.send({
            from: 'Zyntra Exams <onboarding@resend.dev>', // Update this with your verified domain
            to: [to],
            subject: subject,
            html: html,
        });
        console.log(`Email sent to ${to}:`, data);
        return data;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        // Don't throw error to prevent blocking the main flow, just log it
        return null;
    }
};

export const sendStudentCredentials = async (email: string, fullName: string, studentId: string) => {
    const subject = 'Welcome to Zyntra Exams - Your Student Credentials';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Zyntra Exams!</h2>
      <p>Hello ${fullName},</p>
      <p>You have been registered as a student. Here are your login credentials:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Student ID:</strong> ${studentId}</p>
      </div>
      <p>Please use this Student ID to log in to the exam portal.</p>
      <p>Best regards,<br>The Zyntra Team</p>
    </div>
  `;
    return sendEmail(email, subject, html);
};

export const sendAdminInviteEmail = async (email: string, fullName: string, inviteLink: string) => {
    const subject = 'Welcome to Zyntra Exams - Set Up Your Admin Account';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Zyntra Exams!</h2>
      <p>Hello ${fullName},</p>
      <p>You have been invited to be an administrator for your organization on Zyntra Exams.</p>
      <p>Please click the button below to set up your account and password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Account</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Zyntra Team</p>
    </div>
  `;
    return sendEmail(email, subject, html);
};
