import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../services/db';
import argon2 from 'argon2';
import crypto from 'crypto';

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
    const setupLink = `http://localhost:5173/setup-account?token=${setupToken}`;

    return res.status(201).json({
      message: 'Course Admin created successfully. Send them this link to set up their account.',
      user,
      setupLink,
    });
  } catch (error: any) {
    console.error('Error creating course admin:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A user with that email or username already exists.' });
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
    const setupLink = `http://localhost:5173/setup-account?token=${account_setup_token}`;

    // TODO: integrate actual email service (Nodemailer, SendGrid, etc.)
    console.log(`Mock email sent to ${email}: ${setupLink}`);

    res.status(200).json({ message: `Invite email sent to ${email}.`, setupLink });
  } catch (error) {
    console.error('Error sending invite email:', error);
    res.status(500).json({ message: 'Internal server error while sending invite email.' });
  }
};
