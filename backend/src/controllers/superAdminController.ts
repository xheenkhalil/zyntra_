import { Request, Response } from 'express';
import pool from '../services/db';
import argon2 from 'argon2';
import crypto from 'crypto';
// Email service handles Brevo integration
import { AuthRequest } from '../middleware/authMiddleware';
import * as emailService from '../services/emailService';

/**
 * =====================================
 * HELPER FUNCTIONS
 * =====================================
 */

// Audit Log Helper
const logAudit = async (
  action: string,
  details: string,
  userId: string | null | undefined,
  organizationId: string | null | undefined,
) => {
  try {
    const safeOrgId = organizationId && organizationId.length > 0 ? organizationId : null;
    const safeUserId = userId && userId.length > 0 ? userId : null;

    const query = `
      INSERT INTO audit_log (action, details, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
    `;
    // Fire-and-forget
    pool.query(query, [action, details, safeUserId, safeOrgId]);
  } catch (err) {
    console.error('Failed to write to audit log:', err);
  }
};

// Percentage Change Helper
const calculatePercentChange = (current: number | string, previous: number | string): string => {
  const currentNum = Number(current);
  const previousNum = Number(previous);
  if (previousNum === 0) {
    return currentNum > 0 ? '+100.0%' : '+0.0%';
  }
  const change = ((currentNum - previousNum) / previousNum) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

/**
 * =====================================
 * DASHBOARD ANALYTICS (TASK 3)
 * =====================================
 */

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Total Users
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersCount.rows[0].count);

    // Calculate change (users created this month vs last month)
    const usersThisMonth = await pool.query(
      "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'",
    );
    const usersLastMonth = await pool.query(
      "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days'",
    );
    const userChange = calculatePercentChange(
      usersThisMonth.rows[0].count,
      usersLastMonth.rows[0].count,
    );

    // 2. Active Exams
    const examsCount = await pool.query('SELECT COUNT(*) FROM exams');
    const totalExams = parseInt(examsCount.rows[0].count);
    const examsChange = '+5.0%';

    // 3. Organizations
    const orgsCount = await pool.query('SELECT COUNT(*) FROM organizations');
    const totalOrgs = parseInt(orgsCount.rows[0].count);
    const orgsChange = '+2.0%';

    // 4. Revenue (Mock)
    const totalRevenue = 0;
    const revenueChange = '+0.0%';

    res.json({
      totalUsers: { value: totalUsers, change: userChange },
      activeExams: { value: totalExams, change: examsChange },
      organizations: { value: totalOrgs, change: orgsChange },
      monthlyRevenue: { value: totalRevenue, change: revenueChange },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserGrowthChart = async (req: AuthRequest, res: Response) => {
  try {
    const { range } = req.query;
    let interval = '30 days';
    if (range === '7d') interval = '7 days';
    if (range === '90d') interval = '90 days';

    const query = `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '${interval}'
      GROUP BY date
      ORDER BY date ASC;
    `;
    const result = await pool.query(query);

    const labels = result.rows.map((r) => r.date);
    const data = result.rows.map((r) => parseInt(r.count));

    res.json({ labels, data });
  } catch (error: any) {
    console.error('Error fetching user growth chart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSystemPerformanceChart = async (req: AuthRequest, res: Response) => {
  const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
  const cpuData = [12, 15, 45, 60, 55, 30, 20];
  const memoryData = [40, 42, 55, 65, 60, 50, 45];

  res.json({
    labels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: cpuData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      {
        label: 'Memory Usage (%)',
        data: memoryData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  });
};

export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const query = `
      SELECT id, action, details, created_at
      FROM audit_log
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    res.json([]);
  }
};

/**
 * =====================================
 * ORGANIZATION & ADMIN MANAGEMENT (TASK 4)
 * =====================================
 */

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const adminUserId = req.user?.userId;

  if (!name) return res.status(400).json({ message: 'Organization name is required' });

  try {
    const result = await pool.query(
      'INSERT INTO organizations (name, status) VALUES ($1, $2) RETURNING *',
      [name, 'pending'],
    );
    const newOrg = result.rows[0];

    await logAudit('create_organization', `Created organization: ${name}`, adminUserId, newOrg.id);

    res.status(201).json(newOrg);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const adminUserId = req.user?.userId;

  try {
    const result = await pool.query(
      'UPDATE organizations SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Organization not found' });

    await logAudit('update_organization', `Updated organization name to: ${name}`, adminUserId, id);

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const archiveOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId;

  try {
    const result = await pool.query(
      "UPDATE organizations SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Organization not found' });

    await logAudit(
      'archive_organization',
      `Archived organization: ${result.rows[0].name}`,
      adminUserId,
      id,
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error archiving organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unarchiveOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId;

  try {
    const result = await pool.query(
      "UPDATE organizations SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Organization not found' });

    await logAudit(
      'unarchive_organization',
      `Unarchived organization: ${result.rows[0].name}`,
      adminUserId,
      id,
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error unarchiving organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete all users associated with this organization
    await client.query('DELETE FROM users WHERE organization_id = $1', [id]);

    // 2. Delete the organization
    const result = await client.query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Organization not found' });
    }

    await client.query('COMMIT');

    // Log the action (using the main pool, or we could use client)
    await logAudit(
      'delete_organization',
      `Deleted organization: ${result.rows[0].name} and all associated users`,
      adminUserId,
      null,
    );

    res.json({ message: 'Organization and all associated users deleted successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const createCentralAdmin = async (req: AuthRequest, res: Response) => {
  const { fullName, email, username, organizationId } = req.body;
  const adminUserId = req.user?.userId;

  console.log('START: createCentralAdmin', { fullName, email, username, organizationId });

  // Validate inputs
  if (!fullName || !email || !username || !organizationId) {
    console.log('FAIL: Missing fields');
    return res
      .status(400)
      .json({ message: 'All fields (fullName, email, username, organizationId) are required.' });
  }

  try {
    // 1. Check if user exists
    console.log('STEP 1: Checking user existence...');
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [
      email,
      username,
    ]);
    if (userCheck.rows.length > 0) {
      console.log('FAIL: User already exists');
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // 2. Generate Setup Token (instead of temp password)
    console.log('STEP 2: Generating token...');
    const setupToken = crypto.randomUUID();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 3. Create user with 'pending_setup' status
    console.log('STEP 3: Inserting user into DB...');
    const query = `
      INSERT INTO users (full_name, email, username, role, organization_id, status, account_setup_token, account_setup_expires)
      VALUES ($1, $2, $3, 'centraladmin', $4, 'pending_setup', $5, $6)
      RETURNING id, full_name, email, role, organization_id;
    `;
    const result = await pool.query(query, [
      fullName,
      email,
      username,
      organizationId,
      setupToken,
      tokenExpires,
    ]);
    const newUser = result.rows[0];
    console.log('SUCCESS: User inserted', newUser.id);

    await logAudit(
      'create_central_admin',
      `Created central admin: ${fullName} for org ${organizationId}`,
      adminUserId,
      organizationId,
    );

    // 4. Send Invite Email (using Resend)
    const inviteLink = `${process.env.FRONTEND_URL || 'https://zyntra-exams.vercel.app'}/setup-account?token=${setupToken}`;

    console.log('STEP 4: Sending invite email to:', email);
    try {
      await emailService.sendAdminInviteEmail(email, fullName, inviteLink);
      console.log('SUCCESS: Email sent (or attempted)');
    } catch (emailErr) {
      console.error('WARNING: Email sending failed, but continuing:', emailErr);
    }

    console.log('STEP 5: Sending response');
    res.status(201).json({
      message: 'Central Admin created and invite sent.',
      user: newUser,
      setupLink: inviteLink,
    });
  } catch (error: any) {
    console.error('CRITICAL ERROR in createCentralAdmin:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message, error: error });
  }
};

export const sendInviteEmail = async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = userResult.rows[0];

    const setupToken = crypto.randomUUID();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET account_setup_token = $1, account_setup_expires = $2, status = $3 WHERE id = $4',
      [setupToken, tokenExpires, 'pending_setup', userId],
    );

    const inviteLink = `${process.env.FRONTEND_URL || 'https://zyntra-exams.vercel.app'}/setup-account?token=${setupToken}`;

    await emailService.sendAdminInviteEmail(user.email, user.full_name, inviteLink);

    res.json({ message: 'Invite email resent successfully', setupLink: inviteLink });
  } catch (error: any) {
    console.error('Error sending invite email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * =====================================
 * NEW: USER MANAGEMENT (TASK 5)
 * =====================================
 */

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { role, organizationId, search, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const queryParams: any[] = [];
  let whereClauses: string[] = [];

  if (role) {
    queryParams.push(role as string);
    whereClauses.push(`u.role = $${queryParams.length}`);
  }

  if (organizationId) {
    queryParams.push(organizationId as string);
    whereClauses.push(`u.organization_id = $${queryParams.length}`);
  }

  if (search) {
    queryParams.push(`%${search as string}%`);
    whereClauses.push(
      `(u.full_name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length})`,
    );
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const dataQuery = `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      ${whereString}
      ORDER BY u.created_at DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2};
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM users u
      ${whereString};
    `;

    const dataParams = [...queryParams, limitNum, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, queryParams),
    ]);

    const users = dataResult.rows;
    const totalUsers = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.status(200).json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminUserId = req.user?.userId;

  if (!status || (status !== 'active' && status !== 'archived')) {
    return res.status(400).json({ message: "Invalid status. Must be 'active' or 'archived'." });
  }

  try {
    const query = `
      UPDATE users
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, status, organization_id;
    `;
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = result.rows[0];

    await logAudit(
      'user_status_changed',
      `Status of user ${updatedUser.full_name} (${updatedUser.id}) set to ${status}`,
      adminUserId,
      updatedUser.organization_id,
    );

    res.status(200).json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const adminUserId = req.user?.userId;

  const validRoles = ['student', 'teacher', 'centraladmin', 'superadmin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const query = `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, role, organization_id;
    `;
    const result = await pool.query(query, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = result.rows[0];

    await logAudit(
      'user_role_changed',
      `Role of user ${updatedUser.full_name} (${updatedUser.id}) set to ${role}`,
      adminUserId,
      updatedUser.organization_id,
    );

    res.status(200).json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
