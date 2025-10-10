"use strict";
// /backend/src/controllers/analyticsController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseAdminStats = void 0;
const db_1 = __importDefault(require("../services/db"));
const getCourseAdminStats = async (req, res) => {
    const courseAdminId = req.user?.userId;
    const organizationId = req.user?.organizationId;
    const { examId } = req.query;
    try {
        // --- Build dynamic WHERE clause for filtering submissions ---
        let submissionFilter = 'WHERE e.course_admin_id = $1 AND es.status = \'completed\'';
        const submissionParams = [courseAdminId];
        if (examId && examId !== 'all') {
            submissionFilter += ` AND e.id = $2`;
            submissionParams.push(examId);
        }
        // Query 1: Get the simple KPI stats (Students and Live Exams)
        const simpleKpiQuery = `
            SELECT
                (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = 'student') AS total_students,
                (SELECT COUNT(*) FROM exams WHERE course_admin_id = $2 AND status = 'live') AS active_exams;
        `;
        const simpleKpiResult = await db_1.default.query(simpleKpiQuery, [organizationId, courseAdminId]);
        // Query 2: Get the submission-based stats (Avg Score, Pass/Fail)
        const submissionStatsQuery = `
            SELECT
                ROUND(AVG(es.score_percentage), 1) AS average_score,
                CAST(COALESCE(SUM(CASE WHEN es.grade <> 'F' THEN 1 ELSE 0 END), 0) AS INTEGER) as pass_count,
                CAST(COALESCE(SUM(CASE WHEN es.grade = 'F' THEN 1 ELSE 0 END), 0) AS INTEGER) as fail_count
            FROM exam_submissions es
            JOIN exams e ON es.exam_id = e.id
            ${submissionFilter};
        `;
        const submissionStatsResult = await db_1.default.query(submissionStatsQuery, submissionParams);
        // Query 3: Get Top 5 Performing Students
        const topStudentsQuery = `
            SELECT u.full_name, ROUND(AVG(es.score_percentage), 1) as average_score
            FROM exam_submissions es
            JOIN users u ON es.student_id = u.id
            JOIN exams e ON es.exam_id = e.id
            ${submissionFilter}
            GROUP BY u.full_name
            ORDER BY average_score DESC
            LIMIT 5;
        `;
        const topStudentsResult = await db_1.default.query(topStudentsQuery, submissionParams);
        // Query 4: Get exams for the filter dropdown
        const filterExamsQuery = `
            SELECT DISTINCT e.id, e.title FROM exams e
            JOIN exam_submissions es ON e.id = es.exam_id
            WHERE e.course_admin_id = $1;
        `;
        const filterExamsResult = await db_1.default.query(filterExamsQuery, [courseAdminId]);
        // --- Combine all results into the final payload ---
        const finalStats = {
            kpis: {
                total_students: simpleKpiResult.rows[0].total_students,
                active_exams: simpleKpiResult.rows[0].active_exams,
                average_score: submissionStatsResult.rows[0].average_score,
                pass_fail: {
                    pass_count: submissionStatsResult.rows[0].pass_count,
                    fail_count: submissionStatsResult.rows[0].fail_count,
                }
            },
            topStudents: topStudentsResult.rows,
            filterExams: filterExamsResult.rows,
        };
        res.status(200).json(finalStats);
    }
    catch (error) {
        console.error("Error fetching course admin stats:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCourseAdminStats = getCourseAdminStats;
