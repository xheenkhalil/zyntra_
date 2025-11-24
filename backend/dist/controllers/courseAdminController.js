"use strict";
// /backend/src/controllers/courseAdminController.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportStudents = exports.bulkDeleteStudents = exports.deleteStudent = exports.updateStudent = exports.getStudentsForOrg = exports.bulkRegisterStudents = exports.createStudent = exports.generateStudentCode = void 0;
const db_1 = __importDefault(require("../services/db"));
const crypto = __importStar(require("crypto"));
const csv = require('csv-parser');
const emailService_1 = require("../services/emailService");
// --- HELPER FUNCTION (Audit Log - Copied from Proctoring Controller) ---
// This ensures we can log actions securely.
const logAudit = async (action, details, userId, organizationId) => {
    try {
        const query = `
      INSERT INTO audit_log (action, details, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
    `;
        db_1.default.query(query, [action, details, userId, organizationId]);
    }
    catch (err) {
        console.error('Failed to write to audit log:', err);
    }
};
// --- HELPER FUNCTION (Student Code Generation) ---
// Generates a unique 10-character student access code prefixed with 'Z'.
const generateStudentCode = () => {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const timestampComponent = (Date.now() % 100).toString().padStart(2, '0');
    const suffix = (randomHex + timestampComponent).slice(0, 9);
    return `Z${suffix}`;
};
exports.generateStudentCode = generateStudentCode;
// =====================================================
// 1. INDIVIDUAL STUDENT REGISTRATION
// =====================================================
const createStudent = async (req, res) => {
    const { fullName, email } = req.body;
    const teacherUserId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
    }
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden: Organization ID missing.' });
    }
    try {
        const studentCode = (0, exports.generateStudentCode)();
        const query = `
            INSERT INTO users (full_name, email, student_id, role, organization_id, status)
            VALUES ($1, $2, $3, 'student', $4, 'active')
            ON CONFLICT (email) DO NOTHING
            RETURNING id, full_name, email, student_id;
        `;
        const newUserResult = await db_1.default.query(query, [fullName, email, studentCode, organizationId]);
        if (newUserResult.rowCount === 0) {
            return res.status(409).json({ message: 'A user with that email already exists.' });
        }
        const newUser = newUserResult.rows[0];
        // Audit Log
        await logAudit('STUDENT_CREATED_INDIVIDUAL', `Student ${newUser.full_name} registered manually with ID: ${studentCode}`, teacherUserId, organizationId);
        res.status(201).json({
            message: 'Student created successfully. Student ID provided for login.',
            user: newUser,
        });
    }
    catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createStudent = createStudent;
// =====================================================
// 2. BULK STUDENT REGISTRATION (FILE UPLOAD)
// =====================================================
const bulkRegisterStudents = async (req, res) => {
    const teacherUserId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    const sendEmails = req.body.sendEmails === 'true'; // Check if email sending is requested
    if (!req.file || req.file.mimetype !== 'text/csv') {
        return res.status(400).json({ message: 'A CSV file is required for bulk upload.' });
    }
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden: Organization ID missing.' });
    }
    const fileBuffer = req.file.buffer;
    const parseCsv = new Promise((resolve, reject) => {
        const results = [];
        const parser = csv();
        parser.on('data', (data) => {
            // Handle common variations in CSV headers
            const fullName = data.full_name || data.ful_name || data['Full Name'] || data['Name'] || data['name'];
            const email = data.email || data['Email'] || data['E-mail'] || data['e-mail'];
            if (fullName?.trim() && email?.trim()) {
                results.push({ full_name: fullName.trim(), email: email.trim() });
            }
        });
        parser.on('error', (err) => reject(new Error(`CSV Parsing Error: ${err.message}`)));
        parser.on('end', () => resolve(results));
        parser.write(fileBuffer);
        parser.end();
    });
    try {
        const parsedStudents = await parseCsv;
        if (parsedStudents.length === 0) {
            return res.status(400).json({ message: 'No valid student data found in the CSV file.' });
        }
        const client = await db_1.default.connect();
        let registeredCount = 0;
        let errors = 0;
        await client.query('BEGIN');
        const insertQuery = `
            INSERT INTO users (full_name, email, student_id, role, organization_id, status)
            VALUES ($1, $2, $3, 'student', $4, 'active')
            ON CONFLICT (email) DO NOTHING 
            RETURNING id, full_name, email, student_id;
        `;
        for (const student of parsedStudents) {
            const studentCode = (0, exports.generateStudentCode)();
            try {
                const result = await client.query(insertQuery, [
                    student.full_name,
                    student.email,
                    studentCode,
                    organizationId
                ]);
                if ((result.rowCount ?? 0) > 0) {
                    registeredCount++;
                    // Send email if requested
                    if (sendEmails) {
                        // We don't await this to avoid slowing down the bulk process too much, 
                        // but ideally this should be a background job.
                        (0, emailService_1.sendStudentCredentials)(student.email, student.full_name, studentCode).catch(console.error);
                    }
                }
                else {
                    errors++; // Count students skipped due to ON CONFLICT (duplicate email)
                }
            }
            catch (err) {
                errors++;
                console.error(`Error processing student ${student.email}:`, err);
            }
        }
        await client.query('COMMIT');
        // Audit Log
        await logAudit('STUDENTS_BULK_REGISTERED', `${registeredCount} students registered via CSV. ${errors} skipped.`, teacherUserId, organizationId);
        res.status(200).json({
            message: `${registeredCount} students registered successfully.`,
            registeredCount,
            skippedCount: errors,
        });
    }
    catch (error) {
        if (error.message.includes('CSV Parsing Error')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Bulk registration failed:', error);
        res.status(500).json({ message: 'Internal server error during batch registration.' });
    }
};
exports.bulkRegisterStudents = bulkRegisterStudents;
// =====================================================
// 3. READ STUDENTS (WITH PAGINATION)
// =====================================================
const getStudentsForOrg = async (req, res) => {
    const organizationId = req.user?.organizationId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    console.log(`[getStudentsForOrg] Fetching students for Org ID: ${organizationId}, Page: ${page}, Limit: ${limit}`);
    if (!organizationId) {
        console.error('[getStudentsForOrg] Missing Organization ID');
        return res.status(403).json({ message: 'Forbidden: Organization ID missing.' });
    }
    try {
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users
            WHERE organization_id = $1 AND role = 'student';
        `;
        const countResult = await db_1.default.query(countQuery, [organizationId]);
        const total = parseInt(countResult.rows[0].total);
        // Get paginated students
        const query = `
            SELECT id, full_name, email, student_id, created_at FROM users
            WHERE organization_id = $1 AND role = 'student'
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await db_1.default.query(query, [organizationId, limit, offset]);
        console.log(`[getStudentsForOrg] Found ${result.rows.length} students (Total: ${total})`);
        res.status(200).json({
            students: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getStudentsForOrg = getStudentsForOrg;
// =====================================================
// 4. UPDATE STUDENT
// =====================================================
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { full_name, email } = req.body;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const query = `
            UPDATE users 
            SET full_name = $1, email = $2
            WHERE id = $3 AND organization_id = $4 AND role = 'student'
            RETURNING id, full_name, email;
        `;
        const result = await db_1.default.query(query, [full_name, email, id, organizationId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student updated successfully', student: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateStudent = updateStudent;
// =====================================================
// 5. DELETE STUDENT
// =====================================================
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const query = `
            DELETE FROM users 
            WHERE id = $1 AND organization_id = $2 AND role = 'student'
            RETURNING id;
        `;
        const result = await db_1.default.query(query, [id, organizationId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteStudent = deleteStudent;
// =====================================================
// 6. BULK DELETE STUDENTS
// =====================================================
const bulkDeleteStudents = async (req, res) => {
    const { studentIds } = req.body; // Array of student IDs
    const organizationId = req.user?.organizationId;
    const teacherUserId = req.user?.userId;
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'Student IDs are required' });
    }
    try {
        const client = await db_1.default.connect();
        await client.query('BEGIN');
        const query = `
            DELETE FROM users 
            WHERE id = ANY($1) AND organization_id = $2 AND role = 'student'
            RETURNING id;
        `;
        const result = await client.query(query, [studentIds, organizationId]);
        const deletedCount = result.rowCount || 0;
        await client.query('COMMIT');
        client.release();
        // Audit Log
        await logAudit('STUDENTS_BULK_DELETED', `${deletedCount} students deleted in bulk operation`, teacherUserId, organizationId);
        res.status(200).json({
            message: `${deletedCount} student(s) deleted successfully`,
            deletedCount
        });
    }
    catch (error) {
        console.error('Error bulk deleting students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bulkDeleteStudents = bulkDeleteStudents;
// =====================================================
// 7. EXPORT STUDENTS (CSV)
// =====================================================
const exportStudents = async (req, res) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const query = `
            SELECT full_name, email, student_id, created_at 
            FROM users 
            WHERE organization_id = $1 AND role = 'student'
            ORDER BY created_at DESC;
        `;
        const result = await db_1.default.query(query, [organizationId]);
        const students = result.rows;
        const csvHeader = 'Full Name,Email,Student ID,Date Registered\n';
        const csvRows = students.map(s => `"${s.full_name}","${s.email}","${s.student_id}","${new Date(s.created_at).toISOString()}"`).join('\n');
        res.header('Content-Type', 'text/csv');
        res.attachment('students_export.csv');
        res.send(csvHeader + csvRows);
    }
    catch (error) {
        console.error('Error exporting students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.exportStudents = exportStudents;
