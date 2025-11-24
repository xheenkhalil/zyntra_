// /backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import pool from '../services/db';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AuthRequest } from '../middleware/authMiddleware';
import { validatePassword } from '../utils/passwordValidator';

// ===========================================
// LOGIN CONTROLLER
// ===========================================
export const loginUser = async (req: Request, res: Response) => {
    const { email, password, studentId } = req.body;

    try {
        let user;

        // --- Student Login ---
        if (studentId) {
            const userResult = await pool.query(
                "SELECT * FROM users WHERE student_id = $1 AND role = 'student'",
                [studentId]
            );
            if (userResult.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid Student ID' });
            }
            user = userResult.rows[0];

            // --- Admin Login ---
        } else if (email && password) {
            const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            user = userResult.rows[0];

            if (user.role !== 'student') {
                if (!user.password_hash) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                const isPasswordValid = await argon2.verify(user.password_hash, password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            } else {
                return res.status(400).json({ message: 'Students must log in with Student ID.' });
            }
        } else {
            return res.status(400).json({ message: 'Please provide either a Student ID or an email and password.' });
        }

        // --- Account Status Safety Check ---
        if (user.status === 'pending_setup') {
            await pool.query(
                `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`,
                [user.id]
            );
            user.status = 'active';
        } else if (user.status === 'archived') {
            return res.status(403).json({ message: 'Account is archived. Please contact your organization admin.' });
        }

        // --- JWT Creation ---
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            organizationId: user.organization_id,
        };

        if (!config.JWT_SECRET) throw new Error('JWT_SECRET is not defined');

        const token = jwt.sign(tokenPayload, config.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ===========================================
// ACCOUNT SETUP CONTROLLER
// ===========================================
export const setupAccount = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // --- Password Strength Validation ---
    const { valid, errors } = validatePassword(password);
    if (!valid) {
        return res.status(400).json({
            message: 'Password does not meet requirements: ' + errors.join(' '),
        });
    }

    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }

    try {
        const userResult = await pool.query(
            'SELECT id, status FROM users WHERE account_setup_token = $1 AND account_setup_expires > NOW()',
            [token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const user = userResult.rows[0];
        const passwordHash = await argon2.hash(password);

        // --- Update password, clear token, and set status active ---
        const updateQuery = `
            UPDATE users
            SET password_hash = $1,
                account_setup_token = NULL,
                account_setup_expires = NULL,
                status = 'active',
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, full_name, email, role, status;
        `;
        const updatedUser = await pool.query(updateQuery, [passwordHash, user.id]);

        res.status(200).json({
            message: 'Account setup successful. You can now log in.',
            user: updatedUser.rows[0],
        });
    } catch (error) {
        console.error('Account setup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ===========================================
// SESSION CHECK CONTROLLER
// ===========================================
export const getMe = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const userResult = await pool.query(
            'SELECT id, full_name, email, username, role, status, organization_id FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: userResult.rows[0] });
    } catch (error) {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

// ===========================================
// NEW: UPDATE PROFILE CONTROLLER
// ===========================================
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required.' });
    }

    try {
        const query = `
            UPDATE users
            SET full_name = $1, email = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING id, full_name, email, username, role, status, organization_id;
        `;
        const result = await pool.query(query, [fullName, email, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Profile updated successfully.',
            user: result.rows[0]
        });

    } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ===========================================
// NEW: CHANGE PASSWORD CONTROLLER
// ===========================================
export const changeMyPassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All password fields are required.' });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
    }

    // --- Re-using your password strength validation ---
    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
        return res.status(400).json({
            message: 'New password does not meet requirements: ' + errors.join(' '),
        });
    }

    try {
        // 1. Get the user's current password hash
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = userResult.rows[0];

        // 2. Verify the "current password" is correct
        const isPasswordValid = await argon2.verify(user.password_hash, currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // 3. Hash the new password
        const newPasswordHash = await argon2.hash(newPassword);

        // 4. Update the password in the database
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        );

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// ===========================================
// LOGOUT CONTROLLER
// ===========================================
export const logoutUser = (req: Request, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });
    res.status(200).json({ message: 'Logout successful' });
};