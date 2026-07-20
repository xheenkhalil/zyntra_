"use strict";
// /backend/src/controllers/authController.ts
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
exports.verifyOTPAndRegister = exports.sendRegistrationOTP = exports.logoutUser = exports.changeMyPassword = exports.updateMyProfile = exports.getMe = exports.setupAccount = exports.loginUser = void 0;
const db_1 = __importDefault(require("../services/db"));
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const passwordValidator_1 = require("../utils/passwordValidator");
const emailQueue_1 = require("../queues/emailQueue");
const emailService = __importStar(require("../services/emailService"));
const validators_1 = require("../utils/validators");
// ===========================================
// LOGIN CONTROLLER
// ===========================================
const loginUser = async (req, res) => {
    const { email, password, studentId } = req.body;
    try {
        let user;
        // --- Student Login ---
        if (studentId) {
            const userResult = await db_1.default.query("SELECT * FROM users WHERE student_id = $1 AND role = 'student'", [studentId]);
            if (userResult.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid Student ID' });
            }
            user = userResult.rows[0];
            // --- Admin Login ---
        }
        else if (email && password) {
            const userResult = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user = userResult.rows[0];
            if (user.role !== 'student') {
                if (!user.password_hash) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
                const isPasswordValid = await argon2_1.default.verify(user.password_hash, password);
                if (!isPasswordValid) {
                    return res.status(400).json({ message: 'Incorrect credentials' });
                }
            }
            else {
                return res.status(400).json({ message: 'Students must log in with Student ID.' });
            }
        }
        else {
            return res
                .status(400)
                .json({ message: 'Please provide either a Student ID or an email and password.' });
        }
        // --- Account Status Safety Check ---
        if (user.status === 'pending_setup') {
            await db_1.default.query(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [
                user.id,
            ]);
            user.status = 'active';
        }
        else if (user.status === 'archived') {
            return res
                .status(403)
                .json({ message: 'Account is archived. Please contact your organization admin.' });
        }
        // --- JWT Creation ---
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            organizationId: user.organization_id,
        };
        if (!config_1.default.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign(tokenPayload, config_1.default.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // False in dev (HTTP)
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Lax in dev
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status,
                studentId: user.student_id,
            },
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.loginUser = loginUser;
// ===========================================
// ACCOUNT SETUP CONTROLLER
// ===========================================
const setupAccount = async (req, res) => {
    const { token, password } = req.body;
    // --- Password Strength Validation ---
    const { valid, errors } = (0, passwordValidator_1.validatePassword)(password);
    if (!valid) {
        return res.status(400).json({
            message: 'Password does not meet requirements: ' + errors.join(' '),
        });
    }
    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }
    try {
        const userResult = await db_1.default.query('SELECT id, status FROM users WHERE account_setup_token = $1 AND account_setup_expires > NOW()', [token]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const user = userResult.rows[0];
        const passwordHash = await argon2_1.default.hash(password);
        // --- Update password, clear token, and set status active ---
        const updateQuery = `
            UPDATE users
            SET password_hash = $1,
                account_setup_token = NULL,
                account_setup_expires = NULL,
                status = 'active',
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, full_name, email, role, status, organization_id;
        `;
        const updatedUserResult = await db_1.default.query(updateQuery, [passwordHash, user.id]);
        const updatedUser = updatedUserResult.rows[0];
        // If the user is a central admin, activate their organization
        if (updatedUser.role === 'centraladmin' && updatedUser.organization_id) {
            await db_1.default.query("UPDATE organizations SET status = 'active', updated_at = NOW() WHERE id = $1", [updatedUser.organization_id]);
        }
        // Send Welcome Email to Admins/Teachers
        if (updatedUser.role === 'centraladmin' || updatedUser.role === 'courseadmin') {
            try {
                if (emailQueue_1.emailQueue) {
                    await emailQueue_1.emailQueue.add('sendWelcomeEmail', {
                        type: 'sendWelcomeEmail',
                        payload: {
                            email: updatedUser.email,
                            fullName: updatedUser.full_name,
                            role: updatedUser.role,
                        },
                    }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
                    console.log(`[AuthController] Queued welcome email for ${updatedUser.email}`);
                }
                else {
                    await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.full_name, updatedUser.role);
                    console.log(`[AuthController] Welcome email sent synchronously to ${updatedUser.email}`);
                }
            }
            catch (err) {
                console.error('[AuthController] Failed to send/queue welcome email:', err);
            }
        }
        res.status(200).json({
            message: 'Account setup successful. You can now log in.',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Account setup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.setupAccount = setupAccount;
// ===========================================
// SESSION CHECK CONTROLLER
// ===========================================
const getMe = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
        const userResult = await db_1.default.query('SELECT id, full_name, email, username, role, status, organization_id, student_id FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];
        res.status(200).json({
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
                organizationId: user.organization_id,
                studentId: user.student_id,
            },
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Not authenticated' });
    }
};
exports.getMe = getMe;
// ===========================================
// NEW: UPDATE PROFILE CONTROLLER
// ===========================================
const updateMyProfile = async (req, res) => {
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
        const result = await db_1.default.query(query, [fullName, email, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            message: 'Profile updated successfully.',
            user: result.rows[0],
        });
    }
    catch (error) {
        if (error.code === '23505') {
            // Unique constraint violation
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMyProfile = updateMyProfile;
// ===========================================
// NEW: CHANGE PASSWORD CONTROLLER
// ===========================================
const changeMyPassword = async (req, res) => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All password fields are required.' });
    }
    if (currentPassword === newPassword) {
        return res
            .status(400)
            .json({ message: 'New password cannot be the same as the old password.' });
    }
    // --- Re-using your password strength validation ---
    const { valid, errors } = (0, passwordValidator_1.validatePassword)(newPassword);
    if (!valid) {
        return res.status(400).json({
            message: 'New password does not meet requirements: ' + errors.join(' '),
        });
    }
    try {
        // 1. Get the user's current password hash
        const userResult = await db_1.default.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = userResult.rows[0];
        // 2. Verify the "current password" is correct
        const isPasswordValid = await argon2_1.default.verify(user.password_hash, currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }
        // 3. Hash the new password
        const newPasswordHash = await argon2_1.default.hash(newPassword);
        // 4. Update the password in the database
        await db_1.default.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
            newPasswordHash,
            userId,
        ]);
        res.status(200).json({ message: 'Password changed successfully.' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.changeMyPassword = changeMyPassword;
// ===========================================
// LOGOUT CONTROLLER
// ===========================================
const logoutUser = async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.exp) {
                const expiresAt = new Date(decoded.exp * 1000);
                await db_1.default.query('INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)', [
                    token,
                    expiresAt,
                ]);
            }
        }
        catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });
    res.status(200).json({ message: 'Logout successful' });
};
exports.logoutUser = logoutUser;
// ===========================================
// NEW: SEND REGISTRATION OTP
// ===========================================
const sendRegistrationOTP = async (req, res) => {
    const { email, role } = req.body; // role is 'centraladmin' (Org) or 'courseadmin' (Teacher)
    if (!email || !role) {
        return res.status(400).json({ message: 'Email and role are required.' });
    }
    // If Organization, reject generic emails
    if (role === 'centraladmin' && (0, validators_1.isGenericEmail)(email)) {
        return res.status(400).json({ message: 'Organizations must use a custom domain email, not a generic provider (e.g. Gmail).' });
    }
    try {
        // Check if email already exists
        const userCheck = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Save to email_verifications table
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await db_1.default.query('INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)', [email, otp, expiresAt]);
        // Send via email queue or direct
        if (emailQueue_1.emailQueue) {
            await emailQueue_1.emailQueue.add('sendRegistrationOTP', {
                type: 'sendRegistrationOTP',
                payload: { email, otp, role },
            }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        }
        else {
            await emailService.sendRegistrationOTP(email, otp, role);
        }
        res.status(200).json({ message: 'OTP sent successfully.' });
    }
    catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.sendRegistrationOTP = sendRegistrationOTP;
// ===========================================
// NEW: VERIFY OTP AND REGISTER
// ===========================================
const verifyOTPAndRegister = async (req, res) => {
    const { email, otp, password, role, 
    // Org specific
    organizationName, website, size, industry, 
    // Teacher specific
    fullName, schoolName, location, subject, phone } = req.body;
    if (!email || !otp || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Password Strength
    const { valid, errors } = (0, passwordValidator_1.validatePassword)(password);
    if (!valid) {
        return res.status(400).json({ message: 'Password does not meet requirements: ' + errors.join(' ') });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // 1. Verify OTP
        const otpCheck = await client.query('SELECT id FROM email_verifications WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [email, otp]);
        if (otpCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        // 2. Check email uniqueness again to be safe
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Account already exists.' });
        }
        const passwordHash = await argon2_1.default.hash(password);
        let organizationId = null;
        if (role === 'centraladmin') {
            // Organization Registration
            const orgResult = await client.query('INSERT INTO organizations (name, email, website, size, industry, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [organizationName, email, website, size, industry, 'active']);
            organizationId = orgResult.rows[0].id;
            // Create User
            const userResult = await client.query('INSERT INTO users (full_name, email, password_hash, role, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role, status', [organizationName + ' Admin', email, passwordHash, 'centraladmin', organizationId, 'active']);
        }
        else if (role === 'courseadmin') {
            // Teacher Registration
            // Auto-generate an organization for them so logic works
            const orgResult = await client.query('INSERT INTO organizations (name, status) VALUES ($1, $2) RETURNING id', [`${fullName || 'Teacher'}'s Classroom`, 'active']);
            organizationId = orgResult.rows[0].id;
            const userResult = await client.query('INSERT INTO users (full_name, email, password_hash, role, organization_id, status, location, subject, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, full_name, email, role, status', [fullName, email, passwordHash, 'courseadmin', organizationId, 'active', location, subject, phone]);
        }
        else {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
        // Mark OTP as used (by deleting it)
        await client.query('DELETE FROM email_verifications WHERE email = $1', [email]);
        await client.query('COMMIT');
        // Automatically log them in by fetching the newly created user
        const newUser = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = newUser.rows[0];
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            organizationId: user.organization_id,
        };
        if (!config_1.default.JWT_SECRET)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign(tokenPayload, config_1.default.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: 'Registration successful!',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status,
                organizationId: user.organization_id,
            },
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.verifyOTPAndRegister = verifyOTPAndRegister;
