"use strict";
// backend/src/controllers/courseAdminDashboardController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherDashboardBatch = exports.getResultsDistribution = exports.getPerformanceChartData = exports.getCourseAdminStats = void 0;
const db_1 = __importDefault(require("../services/db"));
// ================== 1. GET DASHBOARD STATS (METRIC CARDS) ==================
const getCourseAdminStats = async (req, examId) => {
    const organizationId = req.user?.organizationId;
    console.log(`[getCourseAdminStats] Fetching stats for Org ID: ${organizationId}, Exam Filter: ${examId}`);
    if (!organizationId) {
        throw new Error('Organization ID missing for stats calculation.');
    }
    try {
        // Prepare queries
        let submissionsQuery = `
            SELECT 
                COUNT(es.id) as total_submissions,
                AVG(es.score_percentage) as average_score,
                COUNT(CASE WHEN es.score_percentage >= 70 THEN 1 END) as passed_count
            FROM exam_submissions es 
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1 AND es.status = 'completed'
        `;
        const submissionsParams = [organizationId];
        if (examId && examId !== 'all') {
            submissionsQuery += ` AND e.id = $2`;
            submissionsParams.push(examId);
        }
        // Use Promise.all for parallel execution
        const [studentsResult, examsResult, submissionsResult, auditLogsResult, examsListResult] = await Promise.all([
            // 1. Total Students (Global)
            db_1.default.query('SELECT COUNT(id) as count FROM users WHERE organization_id = $1 AND role = $2', [organizationId, 'student']),
            // 2. Active Exams (Global)
            db_1.default.query('SELECT COUNT(id) as count FROM exams WHERE organization_id = $1 AND status = $2', [organizationId, 'live']),
            // 3. Submissions Stats (Filtered)
            db_1.default.query(submissionsQuery, submissionsParams),
            // 4. Recent Activity (Audit Logs) - Global
            db_1.default
                .query(`
                SELECT action, details, created_at 
                FROM audit_logs 
                WHERE organization_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
            `, [organizationId])
                .catch((err) => {
                console.error('❌❌❌ AUDIT LOGS QUERY FAILED:', err.message);
                return { rows: [] }; // Return empty to prevent 500 crash
            }),
            // 5. Live Exams List for Filter
            db_1.default.query('SELECT id, title FROM exams WHERE organization_id = $1 AND status = $2', [
                organizationId,
                'live',
            ]),
        ]);
        const total_students = parseInt(studentsResult.rows[0]?.count ?? '0', 10);
        const active_exams = parseInt(examsResult.rows[0]?.count ?? '0', 10);
        const subStats = submissionsResult.rows[0] || {};
        const total_submissions = parseInt(subStats.total_submissions ?? '0', 10);
        const avg_score = parseFloat(subStats.average_score ?? '0');
        const passed_count = parseInt(subStats.passed_count ?? '0', 10);
        const pass_rate = total_submissions > 0 ? (passed_count / total_submissions) * 100 : 0;
        const recent_activity = auditLogsResult.rows.map((row) => ({
            action: row.action,
            details: row.details || row.description || '',
            timestamp: row.created_at,
        }));
        const exam_list = examsListResult.rows;
        const stats = {
            totalStudents: total_students,
            activeExams: active_exams,
            averageScore: Math.round(avg_score),
            passRate: `${Math.round(pass_rate)}%`,
            aiInsights: 23,
            passRateChange: '+1.5%',
            recentActivity: recent_activity,
            examList: exam_list,
        };
        return stats;
    }
    catch (error) {
        console.error('❌❌❌ Error in getCourseAdminStats:', error.message);
        console.error(error.stack);
        throw new Error('Failed to fetch key metrics.');
    }
};
exports.getCourseAdminStats = getCourseAdminStats;
// ================== 2. GET PERFORMANCE CHART DATA (LINE) ==================
const getPerformanceChartData = async (req, examId) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId)
        throw new Error('Organization ID missing for ch');
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const params = [organizationId, thirtyDaysAgo];
        let examFilter = '';
        if (examId && examId !== 'all') {
            examFilter = 'AND e.id = $3';
            params.push(examId);
        }
        const query = `
            SELECT 
                DATE_TRUNC('day', es.submitted_at) AS date,
                AVG(es.score_percentage) AS avg_score,
                COUNT(CASE WHEN es.score_percentage >= 70 THEN 1 END) AS passes,
                COUNT(es.id) AS total_submissions
            FROM exam_submissions es
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1 AND es.submitted_at >= $2 AND es.status = 'completed' ${examFilter}
            GROUP BY date
            ORDER BY date ASC;
        `;
        const result = await db_1.default.query(query, params);
        const chartData = {
            labels: result.rows.map((row) => new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            avgScores: result.rows.map((row) => row.avg_score ? parseFloat(row.avg_score).toFixed(1) : '0'),
            passRates: result.rows.map((row) => row.total_submissions > 0 ? ((row.passes / row.total_submissions) * 100).toFixed(1) : '0'),
        };
        return chartData;
    }
    catch (error) {
        console.error('❌ Error fetching performance chart:', error.message);
        throw new Error('Failed to fetch performance chart data.');
    }
};
exports.getPerformanceChartData = getPerformanceChartData;
// ================== 3. GET RESULTS DISTRIBUTION (DOUGHNUT) ==================
const getResultsDistribution = async (req, examId) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId)
        throw new Error('Organization ID missing for chart data.');
    try {
        const params = [organizationId];
        let examFilter = '';
        if (examId && examId !== 'all') {
            examFilter = 'AND e.id = $2';
            params.push(examId);
        }
        const query = `
            SELECT 
                COUNT(CASE WHEN es.score_percentage >= 90 THEN 1 END) AS excellent,
                COUNT(CASE WHEN es.score_percentage >= 80 AND es.score_percentage < 90 THEN 1 END) AS good,
                COUNT(CASE WHEN es.score_percentage >= 70 AND es.score_percentage < 80 THEN 1 END) AS average,
                COUNT(CASE WHEN es.score_percentage < 70 THEN 1 END) AS below_average
            FROM exam_submissions es
            JOIN exams e ON es.exam_id = e.id
            WHERE e.organization_id = $1 AND es.status = 'completed' ${examFilter};
        `;
        const result = await db_1.default.query(query, params);
        const data = result.rows[0] || { excellent: '0', good: '0', average: '0', below_average: '0' };
        const chartData = {
            labels: ['Excellent (90-100)', 'Good (80-89)', 'Average (70-79)', 'Below Average (<70)'],
            data: [
                parseInt(data.excellent, 10) || 0,
                parseInt(data.good, 10) || 0,
                parseInt(data.average, 10) || 0,
                parseInt(data.below_average, 10) || 0,
            ],
            colors: ['rgb(16, 185, 129)', 'rgb(59, 130, 246)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'],
        };
        return chartData;
    }
    catch (error) {
        console.error('❌ Error fetching results distribution chart:', error.message);
        throw new Error('Failed to fetch distribution chart data.');
    }
};
exports.getResultsDistribution = getResultsDistribution;
// ===================================================== // 4. BATCH ENDPOINT - WITH REAL DATA
// =====================================================
const getTeacherDashboardBatch = async (req, res) => {
    const examId = req.query.examId;
    console.log('[BATCH] ✅ Handler reached, User:', req.user, 'ExamFilter:', examId);
    try {
        // Pass examId to getCourseAdminStats to filter metrics
        const stats = await (0, exports.getCourseAdminStats)(req, examId);
        const performanceChart = await (0, exports.getPerformanceChartData)(req, examId);
        const resultsChart = await (0, exports.getResultsDistribution)(req, examId);
        res.status(200).json({
            metrics: stats,
            performance: performanceChart,
            distribution: resultsChart,
        });
    }
    catch (error) {
        console.error('❌❌❌ BATCH ERROR:', error.message);
        res.status(500).json({ message: error.message || 'Failed to load dashboard data' });
    }
};
exports.getTeacherDashboardBatch = getTeacherDashboardBatch;
