import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../services/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import * as emailService from '../services/emailService';

/**
 * Create a new Course Admin and return a setup link.
 */
export const createCourseAdmin = async (req: AuthRequest, res: Response) => {
  const { fullName, email, username, assigned_role_details } = req.body;
  const organizationId = req.user?.organizationId;

  if (!fullName || !email || !username) {
    return res.status(400).json({ message: 'Full name, email, and username are required.' });
  }
  if (!organizationId) {
    return res.status(403).json({ message: 'Forbidden: No organization context detected.' });
  }

  try {
    // Generate secure setup token
    const setupToken = crypto.randomUUID();
    const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Temporary password placeholder
    const placeholderPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await argon2.hash(placeholderPassword);

    const query = `
      INSERT INTO users 
      (full_name, email, username, password_hash, role, organization_id, account_setup_token, account_setup_expires, assigned_role_details, status)
      VALUES ($1, $2, $3, $4, 'courseadmin', $5, $6, $7, $8, 'pending_setup')
      RETURNING id, full_name, email, username, status, created_at;
    `;
    const result = await pool.query(query, [
      fullName,
      email,
      username,
      passwordHash,
      organizationId,
      setupToken,
      setupTokenExpires,
      assigned_role_details || null,
    ]);

    const user = result.rows[0];
    const setupLink = `${process.env.FRONTEND_URL || 'https://zyntra-exams.vercel.app'}/setup-account?token=${setupToken}`;

    // Automatically send invite email via Brevo
    try {
      await emailService.sendAdminInviteEmail(email, fullName, setupLink);
      console.log(`[CentralAdmin] Invite email sent to ${email}`);
    } catch (emailErr) {
      console.error('[CentralAdmin] Email sending failed, but user was created:', emailErr);
    }

    return res.status(201).json({
      message: 'Course Admin created and invite email sent automatically.',
      user,
      setupLink,
    });
  } catch (error: any) {
    console.error('Error creating course admin:', error);
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'A user with that email or username already exists.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Get all Course Admins for an organization.
 */
export const getCourseAdminsForOrg = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    return res.status(403).json({ message: 'Forbidden: No organization context detected.' });
  }

  try {
    const query = `
      SELECT id, full_name, email, username, status, created_at
      FROM users
      WHERE organization_id = $1 AND role = 'courseadmin'
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [organizationId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching course admins:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Update Course Admin details.
 */
export const updateCourseAdmin = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { fullName, username, assigned_role_details } = req.body;
  const organizationId = req.user?.organizationId;

  try {
    const query = `
      UPDATE users
      SET full_name = $1,
          username = $2,
          assigned_role_details = $3,
          updated_at = NOW()
      WHERE id = $4 AND organization_id = $5 AND role = 'courseadmin'
      RETURNING id, full_name, username, email, status, assigned_role_details;
    `;
    const result = await pool.query(query, [
      fullName,
      username,
      assigned_role_details || null,
      userId,
      organizationId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course Admin not found or permission denied.' });
    }

    res.status(200).json({
      message: 'Course Admin updated successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating course admin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Archive (soft delete) a Course Admin.
 */
export const archiveCourseAdmin = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const organizationId = req.user?.organizationId;

  try {
    const query = `
      UPDATE users
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1 AND organization_id = $2 AND role = 'courseadmin'
      RETURNING id, full_name, status;
    `;
    const result = await pool.query(query, [userId, organizationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course Admin not found or permission denied.' });
    }

    res.status(200).json({
      message: 'Course Admin archived successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error archiving course admin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Unarchive (restore) a Course Admin.
 */
export const unarchiveCourseAdmin = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const organizationId = req.user?.organizationId;

  try {
    const query = `
      UPDATE users
      SET status = 'active', updated_at = NOW()
      WHERE id = $1 AND organization_id = $2 AND role = 'courseadmin'
      RETURNING id, full_name, status;
    `;
    const result = await pool.query(query, [userId, organizationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course Admin not found or permission denied.' });
    }

    res.status(200).json({
      message: 'Course Admin restored successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error restoring course admin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Permanently delete a Course Admin.
 */
export const deleteCourseAdmin = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const organizationId = req.user?.organizationId;

  try {
    const query = `
      DELETE FROM users
      WHERE id = $1 AND organization_id = $2 AND role = 'courseadmin';
    `;
    const result = await pool.query(query, [userId, organizationId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Course Admin not found or permission denied.' });
    }

    res.status(200).json({ message: 'Course Admin deleted successfully.' });
  } catch (error) {
    console.error('Error deleting course admin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Send an invitation email (mock endpoint for now).
 */
export const sendInviteEmail = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const organizationId = req.user?.organizationId;

  try {
    const userQuery = `
      SELECT email, account_setup_token
      FROM users
      WHERE id = $1 AND organization_id = $2 AND role = 'courseadmin';
    `;
    const userResult = await pool.query(userQuery, [userId, organizationId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course Admin not found or permission denied.' });
    }

    const { email, account_setup_token } = userResult.rows[0];

    // Regenerate token if expired or missing
    let token = account_setup_token;
    if (!token) {
      token = crypto.randomUUID();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await pool.query(
        'UPDATE users SET account_setup_token = $1, account_setup_expires = $2, status = $3 WHERE id = $4',
        [token, tokenExpires, 'pending_setup', userId],
      );
    }

    const setupLink = `${process.env.FRONTEND_URL || 'https://zyntra-exams.vercel.app'}/setup-account?token=${token}`;

    // Actually send the email via Brevo
    const userFullName = userResult.rows[0].full_name || 'Administrator';
    try {
      await emailService.sendAdminInviteEmail(email, userFullName, setupLink);
      console.log(`[CentralAdmin] Invite re-sent to ${email}`);
    } catch (emailErr) {
      console.error('[CentralAdmin] Failed to resend invite:', emailErr);
      return res.status(500).json({ message: 'Failed to send invite email.' });
    }

    res.status(200).json({ message: `Invite email sent to ${email}.`, setupLink });
  } catch (error) {
    console.error('Error sending invite email:', error);
    res.status(500).json({ message: 'Internal server error while sending invite email.' });
  }
};

/**
 * =====================================
 * NEW: ORGANIZATION DATA (STATS, LOGS, EXAMS, USERS)
 * =====================================
 */

// Helper to calculate percentage change
const calculatePercentChange = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

export const getOrganizationStats = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  console.log('getOrganizationStats called for org:', organizationId);

  if (!organizationId) return res.status(403).json({ message: 'Forbidden' });

  try {
    // 1. Total Teachers
    console.log('Fetching teachers count...');
    const teachersCount = await pool.query(
      "SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'courseadmin'",
      [organizationId],
    );
    console.log('Teachers count result:', teachersCount.rows[0]);
    const totalTeachers = parseInt(teachersCount.rows[0].count);

    // 2. Total Students
    console.log('Fetching students count...');
    const studentsCount = await pool.query(
      "SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'student'",
      [organizationId],
    );
    console.log('Students count result:', studentsCount.rows[0]);
    const totalStudents = parseInt(studentsCount.rows[0].count);

    // 3. Total Exams
    console.log('Fetching exams count...');
    const examsCount = await pool.query('SELECT COUNT(*) FROM exams WHERE organization_id = $1', [
      organizationId,
    ]);
    console.log('Exams count result:', examsCount.rows[0]);
    const totalExams = parseInt(examsCount.rows[0].count);

    // 4. Active Sessions (Active Exams)
    console.log('Fetching active sessions count...');
    const activeSessionsCount = await pool.query(
      "SELECT COUNT(*) FROM exams WHERE organization_id = $1 AND status::text = 'published'",
      [organizationId],
    );
    console.log('Active sessions result:', activeSessionsCount.rows[0]);
    const activeSessions = parseInt(activeSessionsCount.rows[0].count);

    // Helper to calculate growth
    const calculateGrowth = async (table: string, role?: string) => {
      let currentQuery = `SELECT COUNT(*) FROM ${table} WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`;
      let previousQuery = `SELECT COUNT(*) FROM ${table} WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`;
      const params = [organizationId];

      if (role) {
        currentQuery += ` AND role = $2`;
        previousQuery += ` AND role = $2`;
        params.push(role);
      }

      const currentResult = await pool.query(currentQuery, params);
      const previousResult = await pool.query(previousQuery, params);

      const current = parseInt(currentResult.rows[0].count);
      const previous = parseInt(previousResult.rows[0].count);

      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const teacherGrowth = await calculateGrowth('users', 'courseadmin');
    const studentGrowth = await calculateGrowth('users', 'student');
    const examGrowth = await calculateGrowth('exams');

    // --- Chart Data: Growth Trends (Last 6 Months) ---
    const getMonthlyCounts = async (role: string) => {
      const query = `
            SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count
            FROM users
            WHERE organization_id = $1 AND role = $2 AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at) ASC;
        `;
      const result = await pool.query(query, [organizationId, role]);
      return result.rows;
    };

    const studentMonthly = await getMonthlyCounts('student');
    const teacherMonthly = await getMonthlyCounts('courseadmin');

    // --- Chart Data: Exam Status ---
    const examStatusQuery = `
        SELECT 
            SUM(CASE WHEN status::text = 'published' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status::text = 'draft' THEN 1 ELSE 0 END) as not_started,
            SUM(CASE WHEN status::text = 'archived' THEN 1 ELSE 0 END) as completed
        FROM exams
        WHERE organization_id = $1;
    `;
    const examStatusResult = await pool.query(examStatusQuery, [organizationId]);
    const examStatusCounts = examStatusResult.rows[0];

    res.json({
      totalTeachers,
      totalStudents,
      totalExams,
      activeSessions,
      teacherGrowth,
      studentGrowth,
      examGrowth,
      chartData: {
        studentMonthly,
        teacherMonthly,
        examStatus: {
          completed: parseInt(examStatusCounts.completed || '0'),
          inProgress: parseInt(examStatusCounts.in_progress || '0'),
          notStarted: parseInt(examStatusCounts.not_started || '0'),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching org stats:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

export const getOrganizationLogs = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(403).json({ message: 'Forbidden' });

  try {
    const query = `
      SELECT id, action, details, created_at
      FROM audit_log
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    const result = await pool.query(query, [organizationId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching org logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrganizationExams = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(403).json({ message: 'Forbidden' });

  try {
    const query = `
      SELECT e.id, e.title, e.created_at, e.status, u.full_name as created_by_name
      FROM exams e
      LEFT JOIN users u ON e.course_admin_id = u.id
      WHERE e.organization_id = $1
      ORDER BY e.created_at DESC;
    `;
    const result = await pool.query(query, [organizationId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching org exams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrganizationUsers = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  const { role } = req.query;

  if (!organizationId) return res.status(403).json({ message: 'Forbidden' });

  try {
    let query = `
      SELECT id, full_name, email, username, role, status, created_at
      FROM users
      WHERE organization_id = $1
    `;
    const params: any[] = [organizationId];

    if (role && typeof role === 'string') {
      query += ` AND role = $2`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching org users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
