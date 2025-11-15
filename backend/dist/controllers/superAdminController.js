"use strict";
// /backend/src/controllers/superAdminController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.updateUserStatus = exports.getAllUsers = exports.sendInviteEmail = exports.createCentralAdmin = exports.deleteOrganization = exports.unarchiveOrganization = exports.archiveOrganization = exports.updateOrganization = exports.getAllOrganizations = exports.createOrganization = exports.getActivityFeed = exports.getSystemPerformanceChart = exports.getUserGrowthChart = exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../services/db"));
/**
 * =====================================
 * HELPER FUNCTIONS
 * =====================================
 */
// Audit Log Helper
const logAudit = async (action, details, userId, organizationId) => {
    try {
        const query = `
      INSERT INTO audit_log (action, details, user_id, organization_id)
      VALUES ($1, $2, $3, $4)
    `;
        // Fire-and-forget
        db_1.default.query(query, [action, details, userId, organizationId]);
    }
    catch (err) {
        console.error('Failed to write to audit log:', err);
    }
};
// Percentage Change Helper
const calculatePercentChange = (current, previous) => {
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
const getDashboardStats = async (req, res) => {
    // ... implementation ...
};
exports.getDashboardStats = getDashboardStats;
const getUserGrowthChart = async (req, res) => {
    // ... implementation ...
};
exports.getUserGrowthChart = getUserGrowthChart;
const getSystemPerformanceChart = async (req, res) => {
    // ... implementation ...
};
exports.getSystemPerformanceChart = getSystemPerformanceChart;
const getActivityFeed = async (req, res) => {
    // ... implementation ...
};
exports.getActivityFeed = getActivityFeed;
/**
 * =====================================
 * ORGANIZATION & ADMIN MANAGEMENT (TASK 4)
 * =====================================
 */
// ... [createOrganization, getAllOrganizations, updateOrganization, etc.] ...
// (All your existing org/admin functions are here and unchanged)
const createOrganization = async (req, res) => {
    // ... implementation ...
};
exports.createOrganization = createOrganization;
const getAllOrganizations = async (req, res) => {
    // ... implementation ...
};
exports.getAllOrganizations = getAllOrganizations;
const updateOrganization = async (req, res) => {
    // ... implementation ...
};
exports.updateOrganization = updateOrganization;
const archiveOrganization = async (req, res) => {
    // ... implementation ...
};
exports.archiveOrganization = archiveOrganization;
const unarchiveOrganization = async (req, res) => {
    // ... implementation ...
};
exports.unarchiveOrganization = unarchiveOrganization;
const deleteOrganization = async (req, res) => {
    // ... implementation ...
};
exports.deleteOrganization = deleteOrganization;
const createCentralAdmin = async (req, res) => {
    // ... implementation ...
};
exports.createCentralAdmin = createCentralAdmin;
const sendInviteEmail = async (req, res) => {
    // ... implementation ...
};
exports.sendInviteEmail = sendInviteEmail;
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
const getAllUsers = async (req, res) => {
    const { role, organizationId, search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    // This is a secure way to build dynamic queries
    const queryParams = [];
    let whereClauses = [];
    if (role) {
        queryParams.push(role);
        whereClauses.push(`u.role = $${queryParams.length}`);
    }
    if (organizationId) {
        queryParams.push(organizationId);
        whereClauses.push(`u.organization_id = $${queryParams.length}`);
    }
    if (search) {
        queryParams.push(`%${search}%`);
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
            db_1.default.query(dataQuery, dataParams),
            db_1.default.query(countQuery, queryParams) // Count query doesn't need pagination
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
    }
    catch (error) {
        console.error('Error fetching all users:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
// ================== UPDATE USER STATUS (ARCHIVE/ACTIVATE) ==================
/**
 * Updates a user's status (e.g., 'active', 'archived').
 * This is the safe way to "delete" a user.
 */
const updateUserStatus = async (req, res) => {
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
        const result = await db_1.default.query(query, [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = result.rows[0];
        // --- AUDIT LOG ---
        await logAudit('user_status_changed', `Status of user ${updatedUser.full_name} (${updatedUser.id}) set to ${status}`, adminUserId, updatedUser.organization_id);
        // -----------------
        res.status(200).json({
            message: `User status updated to ${status}`,
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Error updating user status:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserStatus = updateUserStatus;
// ================== UPDATE USER ROLE ==================
/**
 * Updates a user's role (e.g., 'student', 'teacher', 'clientadmin', 'superadmin').
 */
const updateUserRole = async (req, res) => {
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
        const result = await db_1.default.query(query, [role, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = result.rows[0];
        // --- AUDIT LOG ---
        await logAudit('user_role_changed', `Role of user ${updatedUser.full_name} (${updatedUser.id}) set to ${role}`, adminUserId, updatedUser.organization_id);
        // -----------------
        res.status(200).json({
            message: `User role updated to ${role}`,
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Error updating user role:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserRole = updateUserRole;
