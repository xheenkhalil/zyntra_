"use strict";
// /backend/src/controllers/courseAdminController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsForOrg = exports.createStudent = void 0;
const db_1 = __importDefault(require("../services/db"));
const createStudent = async (req, res) => {
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
        const newUser = await db_1.default.query(query, [fullName, email, studentId, organizationId]);
        // 3. Return the new user's details, especially the Student ID for the admin to share
        res.status(201).json({
            message: 'Student created successfully. Please provide them with their Student ID to log in.',
            user: newUser.rows[0],
        });
    }
    catch (error) {
        console.error('Error creating student:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A user with that email already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createStudent = createStudent;
const getStudentsForOrg = async (req, res) => {
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
        const result = await db_1.default.query(query, [organizationId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getStudentsForOrg = getStudentsForOrg;
