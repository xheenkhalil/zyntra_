// /backend/src/controllers/superAdminController.ts

import { Request, Response } from 'express';
import pool from '../services/db';
import argon2 from 'argon2';
import crypto from 'crypto';
import { Resend } from 'resend';
import { AuthRequest } from '../middleware/authMiddleware';

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
  organizationId: string | null | undefined
) => {
  try {
    const query = `
      INSERT INTO audit_log (action, details, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
    `;
    // Fire-and-forget
    pool.query(query, [action, details, userId, organizationId]);
  } catch (err) {
    console.error('Failed to write to audit log:', err);
  }
};

// Percentage Change Helper
const calculatePercentChange = (current: number | string, previous: number | string): string => {
  const currentNum = Number(current);
  const previousNum = Number(previous);
  if (previousNum === 0) {
    return currentNum > 0 ? "+100.0%" : "+0.0%";
  }
  const change = ((currentNum - previousNum) / previousNum) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};


/**
 * =====================================
 * DASHBOARD ANALYTICS (TASK 3)
 * =====================================
 */

// ... [getDashboardStats, getUserGrowthChart, getSystemPerformanceChart, getActivityFeed] ...
// (All your existing analytics functions are here and unchanged)
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const getUserGrowthChart = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const getSystemPerformanceChart = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};

/**
 * =====================================
 * ORGANIZATION & ADMIN MANAGEMENT (TASK 4)
 * =====================================
 */

// ... [createOrganization, getAllOrganizations, updateOrganization, etc.] ...
// (All your existing org/admin functions are here and unchanged)
export const createOrganization = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const getAllOrganizations = async (req: Request, res: Response) => {
  // ... implementation ...
};
export const updateOrganization = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const archiveOrganization = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const unarchiveOrganization = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const createCentralAdmin = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};
export const sendInviteEmail = async (req: AuthRequest, res: Response) => {
  // ... implementation ...
};

/**
 * =====================================
 * NEW: USER MANAGEMENT (TASK 5)
 * =====================================
 */

// ================== GET ALL USERS (SEARCHABLE/FILTERABLE) ==================
/**
 * Fetches a paginated, searchable, and filterable list of all users.
 * Superadmin can filter by: ?role=... & ?organizationId=... & ?search=...
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const {
    role,
    organizationId,
    search,
    page = 1,
    limit = 10
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  // This is a secure way to build dynamic queries
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
    // Search by name or email
    whereClauses.push(`(u.full_name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length})`);
  }

  // Combine all WHERE clauses with "AND"
  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    // We run two queries: one for the paginated data, one for the total count
    
    // 1. Query for the data
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
    
    // 2. Query for the total count
    const countQuery = `
      SELECT COUNT(*)
      FROM users u
      ${whereString};
    `;

    // Add pagination params for the data query
    const dataParams = [...queryParams, limitNum, offset];

    // Run both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, queryParams) // Count query doesn't need pagination
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
        limit: limitNum
      }
    });

  } catch (error: any) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ================== UPDATE USER STATUS (ARCHIVE/ACTIVATE) ==================
/**
 * Updates a user's status (e.g., 'active', 'archived').
 * This is the safe way to "delete" a user.
 */
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // The user to update
  const { status } = req.body;
  const adminUserId = req.user?.userId; // The superadmin doing the action

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

    // --- AUDIT LOG ---
    await logAudit(
      'user_status_changed',
      `Status of user ${updatedUser.full_name} (${updatedUser.id}) set to ${status}`,
      adminUserId,
      updatedUser.organization_id
    );
    // -----------------

    res.status(200).json({
      message: `User status updated to ${status}`,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ================== UPDATE USER ROLE ==================
/**
 * Updates a user's role (e.g., 'student', 'teacher', 'clientadmin', 'superadmin').
 */
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // The user to update
  const { role } = req.body;
  const adminUserId = req.user?.userId; // The superadmin doing the action

  const validRoles = ['student', 'teacher', 'clientadmin', 'superadmin'];
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

    // --- AUDIT LOG ---
    await logAudit(
      'user_role_changed',
      `Role of user ${updatedUser.full_name} (${updatedUser.id}) set to ${role}`,
      adminUserId,
      updatedUser.organization_id
    );
    // -----------------

    res.status(200).json({
      message: `User role updated to ${role}`,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};