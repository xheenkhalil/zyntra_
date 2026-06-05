"use strict";
// backend/src/controllers/proctoringController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProctoringStatus = exports.getOrganizationProctoringOverview = exports.getExamProctoringBatch = exports.registerViolation = exports.analyzeTestImage = exports.enrollIdentity = void 0;
const db_1 = __importDefault(require("../services/db"));
const config_1 = __importDefault(require("../config"));
const zyntraAiService_1 = require("../services/zyntraAiService");
// --- Helper Functions ---
const logAudit = async (action, details, userId, organizationId) => {
    try {
        const query = `INSERT INTO audit_log (action, details, user_id, organization_id) VALUES ($1, $2, $3, $4)`;
        db_1.default.query(query, [action, details, userId, organizationId]);
    }
    catch (err) {
        console.error('Failed to write to audit log:', err);
    }
};
/**
 * =====================================
 * 1. IDENTITY ENROLLMENT (TASK 1)
 * =====================================
 */
const enrollIdentity = async (req, res) => {
    const studentId = req.user?.userId;
    const { base64Images } = req.body;
    if (!studentId)
        return res.status(401).json({ message: 'Authentication required.' });
    if (!base64Images || base64Images.length < 3) {
        return res
            .status(400)
            .json({ message: 'At least 3 reference images are required for enrollment.' });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // Save profile to DB, storing base64 reference images directly
        const saveQuery = `
            INSERT INTO proctor_profiles (user_id, reference_images, rekognition_collection_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE SET
                reference_images = $2,
                rekognition_collection_id = $3,
                created_at = NOW()
            RETURNING *;
        `;
        await client.query(saveQuery, [studentId, JSON.stringify(base64Images), null]);
        await client.query('COMMIT');
        res.status(200).json({
            message: 'Identity successfully enrolled.',
            referenceUrls: base64Images,
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Proctoring Enrollment FATAL ERROR:', error);
        res.status(500).json({ message: `Enrollment failed: ${error.message}` });
    }
    finally {
        client.release();
    }
};
exports.enrollIdentity = enrollIdentity;
/**
 * =====================================
 * 2. IMAGE ANALYSIS (IDENTITY VERIFICATION)
 * =====================================
 */
const analyzeTestImage = async (req, res) => {
    const studentId = req.user?.userId;
    const { base64Image } = req.body;
    const submissionId = req.body.submissionId || req.body.submission_id;
    if (!studentId)
        return res.status(401).json({ message: 'Authentication required.' });
    if (!base64Image || !submissionId) {
        return res.status(400).json({ message: 'Image and submission ID are required.' });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // Step 1: Verify student profile exists
        const profileResult = await client.query('SELECT reference_images FROM proctor_profiles WHERE user_id = $1', [studentId]);
        if (profileResult.rows.length === 0 || profileResult.rows[0].reference_images.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                message: 'Identity profile not found. Please enroll first.',
                code: 'ENROLLMENT_REQUIRED',
            });
        }
        // Step 2: Get student's email for Zyntra session verification
        const userResult = await client.query('SELECT email FROM users WHERE id = $1', [studentId]);
        const studentEmail = userResult.rows[0]?.email || studentId;
        // Step 3: Perform Zyntra AI analysis (Fail-open resilience wrapper)
        const analysis = await (0, zyntraAiService_1.analyzeImageFrame)(submissionId, studentEmail, base64Image);
        // Step 4: Construct snapshot URL from Zyntra AI's hosted storage if available
        const snapshotUrl = (analysis && analysis.snapshot_id)
            ? `${config_1.default.ZYNTRA_API_URL}/static/snapshots/${analysis.snapshot_id}.jpg`
            : null;
        const violationsToRegister = [];
        if (analysis) {
            // Map Zyntra AI metrics to DB flag types
            if (analysis.face_match === false) {
                violationsToRegister.push({
                    type: 'SUBJECT_MISMATCH',
                    reason: `Face mismatch. Score similarity: ${(analysis.face_score * 100).toFixed(1)}%`
                });
            }
            if (analysis.violations && Array.isArray(analysis.violations)) {
                for (const violation of analysis.violations) {
                    if (violation === 'LOOKING_AWAY') {
                        violationsToRegister.push({ type: 'LOOKING_AWAY', reason: 'Gaze deviation (looking away).' });
                    }
                    else if (violation === 'PHONE_DETECTED' || analysis.phone_detected) {
                        violationsToRegister.push({ type: 'PHONE_DETECTED', reason: 'Mobile device detected in frame.' });
                    }
                    else if (violation === 'MULTIPLE_PEOPLE' || analysis.person_count > 1) {
                        violationsToRegister.push({ type: 'MULTIPLE_PEOPLE', reason: `Multiple people detected (${analysis.person_count} found).` });
                    }
                    else if (violation === 'NO_FACE_DETECTED' || analysis.person_count === 0) {
                        violationsToRegister.push({ type: 'NO_FACE_DETECTED', reason: 'No face detected in camera feed.' });
                    }
                    else if (violation === 'FACE_MISMATCH') {
                        // Only add if not already captured by face_match check
                        const alreadyAdded = violationsToRegister.some(v => v.type === 'SUBJECT_MISMATCH');
                        if (!alreadyAdded) {
                            violationsToRegister.push({ type: 'SUBJECT_MISMATCH', reason: 'Identity mismatch detected.' });
                        }
                    }
                }
            }
        }
        // Step 5: Save detected violations as flags in DB
        if (violationsToRegister.length > 0) {
            for (const v of violationsToRegister) {
                await logAudit(v.type, v.reason, studentId, undefined);
                await client.query(`
            INSERT INTO proctor_flags (submission_id, student_id, type, image_url, warning_count, analysis_data)
            VALUES ($1, $2, $3, $4, 1, $5)
            ON CONFLICT DO NOTHING;
          `, [
                    submissionId,
                    studentId,
                    v.type,
                    snapshotUrl,
                    JSON.stringify({ reason: v.reason, analysisResponse: analysis }),
                ]);
            }
        }
        await client.query('COMMIT');
        res.status(200).json({ status: violationsToRegister.length > 0 ? 'FLAGGED' : 'VERIFIED' });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Image Analysis Error:', error);
        // Fail-open: allow student to proceed even if AI analysis encounters an error
        res.status(200).json({ status: 'VERIFIED', warning: `Analysis server error: ${error.message}` });
    }
    finally {
        client.release();
    }
};
exports.analyzeTestImage = analyzeTestImage;
/**
 * =====================================
 * 3. VIOLATION ENFORCEMENT
 * =====================================
 */
const registerViolation = async (req, res) => {
    const studentId = req.user?.userId;
    const submissionId = req.body.submissionId || req.body.submission_id;
    const violationType = req.body.violationType || req.body.violation_type;
    const MAX_WARNINGS = 3;
    if (!studentId)
        return res.status(401).json({ message: 'Authentication required.' });
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        const submissionQuery = `
            SELECT warning_count, exam_id, status 
            FROM exam_submissions 
            WHERE id = $1 AND student_id = $2 FOR UPDATE;
        `;
        const submissionResult = await client.query(submissionQuery, [submissionId, studentId]);
        const submission = submissionResult.rows[0];
        if (!submission || submission.status !== 'in_progress') {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Exam not active.' });
        }
        const currentWarnings = submission.warning_count || 0;
        const newWarnings = currentWarnings + 1;
        await client.query(`
            INSERT INTO proctor_flags (submission_id, student_id, type, warning_count, analysis_data)
            VALUES ($1, $2, $3, $4, $5);
        `, [
            submissionId,
            studentId,
            violationType,
            newWarnings,
            JSON.stringify({ reason: violationType }),
        ]);
        if (newWarnings >= MAX_WARNINGS) {
            await client.query(`
                UPDATE exam_submissions 
                SET status = 'submitted_auto', submitted_at = NOW(), warning_count = $1 
                WHERE id = $2;
            `, [newWarnings, submissionId]);
            // Finalize the Zyntra AI session when auto-submitted due to limit
            try {
                await (0, zyntraAiService_1.closeExamSession)(submissionId);
            }
            catch (err) {
                console.error('[Zyntra] Failed to close session on auto-submit:', err.message);
            }
            await client.query('COMMIT');
            return res.status(200).json({ status: 'AUTO_SUBMITTED' });
        }
        else {
            await client.query(`
                UPDATE exam_submissions SET warning_count = $1 WHERE id = $2;
            `, [newWarnings, submissionId]);
            await client.query('COMMIT');
            return res.status(200).json({ status: 'WARNING_ISSUED', warnings: newWarnings });
        }
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Violation Error:', error);
        res.status(500).json({ message: 'Failed to register violation.' });
    }
    finally {
        client.release();
    }
};
exports.registerViolation = registerViolation;
/**
 * =====================================
 * 4. TEACHER DASHBOARD BATCH DATA
 * =====================================
 */
const getExamProctoringStats = async (examId) => {
    console.log(`[Proctoring] Fetching stats for exam ${examId}`);
    const activeCandidatesQuery = `
        SELECT COUNT(es.student_id) AS count
        FROM exam_submissions es
        WHERE es.exam_id = $1 AND es.status = 'in_progress';
    `;
    const activeCandidatesResult = await db_1.default.query(activeCandidatesQuery, [examId]);
    const activeCandidates = parseInt(activeCandidatesResult.rows[0].count, 10);
    const alertsQuery = `
        SELECT COUNT(id) AS count
        FROM proctor_flags 
        WHERE submission_id IN (
            SELECT id FROM exam_submissions WHERE exam_id = $1
        );
    `;
    const alertsResult = await db_1.default.query(alertsQuery, [examId]);
    const totalAlerts = parseInt(alertsResult.rows[0].count, 10);
    const verifiedSessionsQuery = `
        SELECT COUNT(id) AS count
        FROM exam_submissions
        WHERE exam_id = $1 AND status = 'in_progress' AND warning_count = 0;
    `;
    const verifiedSessionsResult = await db_1.default.query(verifiedSessionsQuery, [examId]);
    const verifiedSessions = parseInt(verifiedSessionsResult.rows[0].count, 10);
    const aiDetectionsQuery = `
        SELECT COUNT(id) AS count
        FROM proctor_flags 
        WHERE submission_id IN (
            SELECT id FROM exam_submissions WHERE exam_id = $1
        ) AND type IN ('NO_FACE_DETECTED', 'SUBJECT_MISMATCH', 'FACE_BLURRED');
    `;
    const aiDetectionsResult = await db_1.default.query(aiDetectionsQuery, [examId]);
    const aiDetections = parseInt(aiDetectionsResult.rows[0].count, 10);
    return {
        activeCandidates,
        totalAlerts,
        verifiedSessions,
        aiDetections,
    };
};
const getProctorAlerts = async (examId) => {
    console.log(`[Proctoring] Fetching alerts for exam ${examId}`);
    const alertsQuery = `
        SELECT pf.type, pf.created_at, pf.analysis_data, 
               u.full_name, u.email, u.student_id, 
               es.warning_count
        FROM proctor_flags pf
        JOIN exam_submissions es ON pf.submission_id = es.id
        JOIN users u ON es.student_id = u.id
        WHERE es.exam_id = $1
        ORDER BY pf.created_at DESC
        LIMIT 100;
    `;
    const alertsResult = await db_1.default.query(alertsQuery, [examId]);
    return alertsResult.rows;
};
const getLiveProctorCandidates = async (examId) => {
    console.log(`[Proctoring] Fetching live candidates for exam ${examId}`);
    // Optimized query to get the LATEST image and flag for each student
    const candidatesQuery = `
        SELECT 
            es.id AS submission_id, 
            u.full_name, 
            u.email, 
            u.student_id, 
            es.warning_count, 
            es.time_remaining_seconds,
            (
                SELECT image_url 
                FROM proctor_flags pf 
                WHERE pf.submission_id = es.id AND pf.image_url IS NOT NULL
                ORDER BY pf.created_at DESC 
                LIMIT 1
            ) AS latest_image_url,
            (
                SELECT type 
                FROM proctor_flags pf 
                WHERE pf.submission_id = es.id 
                ORDER BY pf.created_at DESC 
                LIMIT 1
            ) AS latest_flag_type
        FROM exam_submissions es
        JOIN users u ON es.student_id = u.id
        WHERE es.exam_id = $1 AND es.status = 'in_progress'
        ORDER BY es.warning_count DESC, es.time_remaining_seconds DESC;
    `;
    try {
        const candidatesResult = await db_1.default.query(candidatesQuery, [examId]);
        return candidatesResult.rows;
    }
    catch (err) {
        console.error('Error in getLiveProctorCandidates:', err);
        throw err;
    }
};
const getExamProctoringBatch = async (req, res) => {
    const { examId } = req.params;
    const adminOrgId = req.user?.organizationId;
    const adminUserId = req.user?.userId;
    const userRole = req.user?.role;
    console.log(`[Proctoring] getExamProctoringBatch called for exam ${examId} by user ${adminUserId}`);
    try {
        // Fetch exam with both organization_id and course_admin_id
        const examResult = await db_1.default.query('SELECT organization_id, course_admin_id FROM exams WHERE id = $1', [examId]);
        if (examResult.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        const exam = examResult.rows[0];
        if (userRole !== 'superadmin') {
            const belongsToOrg = exam.organization_id === adminOrgId;
            const ownsExam = exam.course_admin_id === adminUserId;
            if (!belongsToOrg) {
                return res
                    .status(403)
                    .json({ message: 'Forbidden: Exam does not belong to your organization.' });
            }
            // Strict ownership check: only the creator can view proctoring data
            if (!ownsExam) {
                return res
                    .status(403)
                    .json({ message: 'Forbidden: You do not have permission to access this exam.' });
            }
        }
        const stats = await getExamProctoringStats(examId);
        const alerts = await getProctorAlerts(examId);
        const candidates = await getLiveProctorCandidates(examId);
        // Real detection chart data from DB
        let detectionChartData = { labels: ['No Data'], data: [0] };
        try {
            const detectionQuery = `
        SELECT pf.type, COUNT(*)::int AS count
        FROM proctor_flags pf
        JOIN exam_submissions es ON pf.submission_id = es.id
        WHERE es.exam_id = $1
        GROUP BY pf.type
        ORDER BY count DESC;
      `;
            const detectionResult = await db_1.default.query(detectionQuery, [examId]);
            if (detectionResult.rows.length > 0) {
                detectionChartData = {
                    labels: detectionResult.rows.map((r) => r.type),
                    data: detectionResult.rows.map((r) => r.count),
                };
            }
        }
        catch (chartErr) {
            console.error('[Proctoring] Detection chart query failed:', chartErr.message);
        }
        // Real threat timeline data from DB
        let threatChartData = { labels: ['--'], critical: [0], high: [0], medium: [0] };
        try {
            const threatQuery = `
        SELECT 
          to_char(date_trunc('minute', pf.created_at), 'HH24:MI') AS time_label,
          COUNT(CASE WHEN pf.type IN ('SUBJECT_MISMATCH', 'NO_FACE_DETECTED') THEN 1 END)::int AS critical,
          COUNT(CASE WHEN pf.type IN ('MULTIPLE_PEOPLE', 'PHONE_DETECTED') THEN 1 END)::int AS high,
          COUNT(CASE WHEN pf.type IN ('LOOKING_AWAY', 'TAB_SWITCH', 'MOUSE_LEFT') THEN 1 END)::int AS medium
        FROM proctor_flags pf
        JOIN exam_submissions es ON pf.submission_id = es.id
        WHERE es.exam_id = $1
        GROUP BY date_trunc('minute', pf.created_at)
        ORDER BY date_trunc('minute', pf.created_at) ASC
        LIMIT 20;
      `;
            const threatResult = await db_1.default.query(threatQuery, [examId]);
            if (threatResult.rows.length > 0) {
                threatChartData = {
                    labels: threatResult.rows.map((r) => r.time_label),
                    critical: threatResult.rows.map((r) => r.critical),
                    high: threatResult.rows.map((r) => r.high),
                    medium: threatResult.rows.map((r) => r.medium),
                };
            }
        }
        catch (chartErr) {
            console.error('[Proctoring] Threat chart query failed:', chartErr.message);
        }
        // Session history: completed/auto-submitted sessions
        let historyRows = [];
        try {
            const historyQuery = `
        SELECT 
          es.id AS submission_id,
          u.full_name,
          u.student_id,
          u.email,
          es.status::text,
          es.score_percentage,
          es.grade,
          es.warning_count,
          es.proctoring_report,
          es.submitted_at
        FROM exam_submissions es
        JOIN users u ON es.student_id = u.id
        WHERE es.exam_id = $1 AND es.status::text IN ('completed', 'submitted_auto')
        ORDER BY es.submitted_at DESC;
      `;
            const historyResult = await db_1.default.query(historyQuery, [examId]);
            historyRows = historyResult.rows;
        }
        catch (histErr) {
            console.error('[Proctoring] History query failed:', histErr.message);
        }
        res.status(200).json({
            metrics: stats,
            alerts: alerts,
            candidates: candidates,
            history: historyRows,
            charts: {
                detection: detectionChartData,
                threatLevel: threatChartData,
            },
        });
    }
    catch (error) {
        console.error('Error fetching proctoring dashboard data:', error);
        console.error('Stack trace:', error.stack);
        res
            .status(500)
            .json({
            message: 'Internal server error while loading dashboard data.',
            error: error.message,
        });
    }
};
exports.getExamProctoringBatch = getExamProctoringBatch;
/**
 * =====================================
 * 5. ORGANIZATION OVERVIEW (NEW)
 * =====================================
 */
const getOrganizationProctoringOverview = async (req, res) => {
    const adminOrgId = req.user?.organizationId;
    const adminUserId = req.user?.userId;
    if (!adminOrgId)
        return res.status(400).json({ message: 'Organization ID required.' });
    try {
        // Fetch all exams for this course admin in the organization
        // We only show exams created by this admin to maintain strict ownership
        const query = `
            SELECT 
                e.id, 
                e.title, 
                e.status,
                e.created_at,
                (SELECT COUNT(*) FROM exam_submissions es WHERE es.exam_id = e.id AND es.status = 'in_progress') as active_candidates,
                (SELECT COUNT(*) FROM proctor_flags pf JOIN exam_submissions es ON pf.submission_id = es.id WHERE es.exam_id = e.id) as total_alerts
            FROM exams e
            WHERE e.organization_id = $1 AND e.course_admin_id = $2
            ORDER BY e.created_at DESC
        `;
        const result = await db_1.default.query(query, [adminOrgId, adminUserId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching organization proctoring overview:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.getOrganizationProctoringOverview = getOrganizationProctoringOverview;
/**
 * =====================================
 * 6. STATUS CHECK
 * =====================================
 */
const getProctoringStatus = async (req, res) => {
    const studentId = req.user?.userId;
    if (!studentId)
        return res.status(401).json({ message: 'Authentication required.' });
    try {
        const result = await db_1.default.query('SELECT 1 FROM proctor_profiles WHERE user_id = $1', [
            studentId,
        ]);
        res.status(200).json({
            enrolled: result.rows.length > 0,
        });
    }
    catch (error) {
        console.error('Error checking proctoring status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.getProctoringStatus = getProctoringStatus;
