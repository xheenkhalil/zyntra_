// /backend/src/controllers/courseAdminController.ts

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../services/db';

export const createStudent = async (req: AuthRequest, res: Response) => {
    const { fullName, email } = req.body;
    const organizationId = req.user?.organizationId;

    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
    }
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden: You are not associated with an organization' });
    }

    try {
        // 1. Generate a unique Student ID
        const studentId = `ZYN-${Math.floor(100000 + Math.random() * 900000)}`;

        // 2. Insert the new student into the database (NO PASSWORD)
        const query = `
            INSERT INTO users (full_name, email, student_id, role, organization_id)
            VALUES ($1, $2, $3, 'student', $4)
            RETURNING id, full_name, email, student_id;
        `;
        const newUser = await pool.query(query, [fullName, email, studentId, organizationId]);

        // 3. Return the new user's details, especially the Student ID for the admin to share
        res.status(201).json({
            message: 'Student created successfully. Please provide them with their Student ID to log in.',
            user: newUser.rows[0],
        });

    } catch (error: any) {
        console.error('Error creating student:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A user with that email already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStudentsForOrg = async (req: AuthRequest, res: Response) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden: You are not associated with an organization' });
    }

    try {
        const query = `
            SELECT id, full_name, email, student_id, created_at FROM users
            WHERE organization_id = $1 AND role = 'student'
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [organizationId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};