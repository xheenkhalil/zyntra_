"use strict";
// /backend/src/controllers/superAdminController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = exports.createCentralAdmin = exports.deleteOrganization = exports.unarchiveOrganization = exports.archiveOrganization = exports.updateOrganization = exports.getAllOrganizations = exports.createOrganization = void 0;
const db_1 = __importDefault(require("../services/db"));
const argon2_1 = __importDefault(require("argon2")); // Added for password hashing
const crypto_1 = __importDefault(require("crypto")); // Added for token generation
/**
 * =====================================
 * SUPER ADMIN CONTROLLER
 * Handles CRUD operations for organizations and their admins.
 * =====================================
 */
// ================== CREATE ORGANIZATION ==================
const createOrganization = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Organization name is required' });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // 1. Insert new organization
        const orgQuery = `
      INSERT INTO organizations (name, status, created_at, updated_at)
      VALUES ($1, 'active', NOW(), NOW())
      RETURNING id, name, status, created_at
    `;
        const orgResult = await client.query(orgQuery, [name]);
        const organization = orgResult.rows[0];
        // 2. Create default subscription
        const subQuery = `
      INSERT INTO subscriptions (organization_id, tier, max_students, max_quizzes)
      VALUES ($1, $2, $3, $4)
    `;
        await client.query(subQuery, [organization.id, 'free', 20, 2]);
        await client.query('COMMIT');
        res.status(201).json({
            message: `Organization "${organization.name}" created successfully`,
            organization,
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Internal server error while creating organization' });
    }
    finally {
        client.release();
    }
};
exports.createOrganization = createOrganization;
// ================== READ ALL ==================
const getAllOrganizations = async (req, res) => {
    try {
        const query = `
      SELECT o.id, o.name, COALESCE(o.status, 'active') AS status,
             o.created_at, COALESCE(s.tier, 'free') AS tier
      FROM organizations o
      LEFT JOIN subscriptions s ON o.id = s.organization_id
      ORDER BY o.created_at DESC
    `;
        const result = await db_1.default.query(query);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Internal server error while fetching organizations' });
    }
};
exports.getAllOrganizations = getAllOrganizations;
// ================== UPDATE ==================
const updateOrganization = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Organization name is required' });
    }
    try {
        const query = `
      UPDATE organizations
      SET name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, status, updated_at
    `;
        const result = await db_1.default.query(query, [name, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({
            message: `Organization "${result.rows[0].name}" updated successfully`,
            organization: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ message: 'Internal server error while updating organization' });
    }
};
exports.updateOrganization = updateOrganization;
// ================== ARCHIVE ==================
const archiveOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "UPDATE organizations SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *";
        const archivedOrg = await db_1.default.query(query, [id]);
        if (archivedOrg.rows.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization archived successfully', organization: archivedOrg.rows[0] });
    }
    catch (error) {
        console.error('Error archiving organization:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.archiveOrganization = archiveOrganization;
// ================== UNARCHIVE / RESTORE ==================
const unarchiveOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "UPDATE organizations SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *";
        const unarchivedOrg = await db_1.default.query(query, [id]);
        if (unarchivedOrg.rows.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization restored successfully.', organization: unarchivedOrg.rows[0] });
    }
    catch (error) {
        console.error('Error unarchiving organization:', error);
        res.status(500).json({ message: 'Internal server error while unarchiving organization' });
    }
};
exports.unarchiveOrganization = unarchiveOrganization;
// ================== DELETE ==================
const deleteOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.default.query('DELETE FROM organizations WHERE id = $1 RETURNING name', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: `Organization "${result.rows[0].name}" deleted successfully` });
    }
    catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Cannot delete organization: it still has users or data linked to it. Please archive it instead.',
            });
        }
        console.error('Error deleting organization:', error);
        res.status(500).json({ message: 'Internal server error while deleting organization' });
    }
};
exports.deleteOrganization = deleteOrganization;
// ================== CREATE CENTRAL ADMIN FOR ORG (NEW FUNCTION) ==================
const createCentralAdmin = async (req, res) => {
    const { fullName, email, username, organizationId } = req.body;
    if (!fullName || !email || !username || !organizationId) {
        return res.status(400).json({ message: 'All fields are required: fullName, email, username, organizationId' });
    }
    try {
        // 1. Generate a secure, random token for account setup
        const setupToken = crypto_1.default.randomUUID();
        const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours
        // 2. Create a placeholder password hash
        const placeholderPassword = crypto_1.default.randomBytes(16).toString('hex');
        const passwordHash = await argon2_1.default.hash(placeholderPassword);
        // 3. Insert the new Central Admin into the database
        const query = `
            INSERT INTO users (full_name, email, username, password_hash, role, organization_id, account_setup_token, account_setup_expires)
            VALUES ($1, $2, $3, $4, 'centraladmin', $5, $6, $7)
            RETURNING id, full_name, email, username;
        `;
        const newUser = await db_1.default.query(query, [
            fullName, email, username, passwordHash, organizationId, setupToken, setupTokenExpires
        ]);
        // 4. Return the setup link for the Super Admin to share
        const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-account?token=${setupToken}`;
        res.status(201).json({
            message: 'Central Admin created successfully. Share this link for account setup.',
            user: newUser.rows[0],
            setupLink
        });
    }
    catch (error) {
        console.error('Error creating central admin:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A user with that email or username already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCentralAdmin = createCentralAdmin;
// Add these imports at the top of the file
const resend_1 = require("resend");
// Add this new function to the bottom of /backend/src/controllers/superAdminController.ts
const sendInviteEmail = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    try {
        // Find the user to get their email and token
        const userResult = await db_1.default.query('SELECT email, full_name, account_setup_token FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = userResult.rows[0];
        const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-account?token=${user.account_setup_token}`;
        // Send the email using Resend
        const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'onboarding@zyntra.com', // Replace with your verified sender email
            to: user.email,
            subject: 'Your Invitation to Join Zyntra',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to Zyntra, ${user.full_name}!</h2>
                    <p>You have been invited to join your organization on the Zyntra platform.</p>
                    <p>Please click the button below to set up your account and create your password. This link is valid for 24 hours.</p>
                    <a href="${setupLink}" style="display: inline-block; padding: 12px 24px; background-color: #3C4DCE; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                        Set Up Your Account
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">If you did not expect this invitation, please disregard this email.</p>
                </div>
            `,
        });
        res.status(200).json({ message: `Invitation email sent to ${user.email} successfully.` });
    }
    catch (error) {
        console.error("Error sending invite email:", error);
        res.status(500).json({ message: 'Failed to send invitation email.' });
    }
};
exports.sendInviteEmail = sendInviteEmail;
