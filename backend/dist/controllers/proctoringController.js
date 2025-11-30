"use strict";
// backend/src/controllers/proctoringController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProctoringStatus = exports.getOrganizationProctoringOverview = exports.getExamProctoringBatch = exports.registerViolation = exports.analyzeTestImage = exports.enrollIdentity = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_rekognition_1 = require("@aws-sdk/client-rekognition");
const db_1 = __importDefault(require("../services/db"));
// --- AWS Client Initialization ---
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const s3Client = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const rekognitionClient = new client_rekognition_1.RekognitionClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
// --- Helper Functions ---
const uploadBase64Image = async (base64Image, key) => {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    if (!S3_BUCKET_NAME)
        throw new Error("S3 Bucket name not configured.");
    const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
    };
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    }
    catch (err) {
        console.error("S3 Upload Error:", err);
        throw new Error(`Failed to upload image to S3: ${err}`);
    }
};
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
        return res.status(401).json({ message: "Authentication required." });
    if (!base64Images || base64Images.length < 3) {
        return res.status(400).json({ message: "At least 3 reference images are required for enrollment." });
    }
    const client = await db_1.default.connect();
    const collectionId = `ZYNTRA_USER_${studentId.replace(/-/g, '')}`;
    const uploadedUrls = [];
    try {
        await client.query('BEGIN');
        // Step 1: Create/Check Rekognition Collection
        try {
            await rekognitionClient.send(new client_rekognition_1.CreateCollectionCommand({ CollectionId: collectionId }));
            console.log(`Created Rekognition Collection: ${collectionId}`);
        }
        catch (e) {
            if (e.name !== 'ResourceAlreadyExistsException') {
                console.error("Rekognition CreateCollection Error:", e);
                throw new Error(`Failed to init face collection: ${e.message}`);
            }
        }
        // Step 2: Upload images and Index Faces
        for (let i = 0; i < base64Images.length; i++) {
            const fileKey = `proctor_source/${studentId}_source_${i}_${Date.now()}.jpeg`;
            // Upload to S3
            const publicUrl = await uploadBase64Image(base64Images[i], fileKey);
            uploadedUrls.push(publicUrl);
            // Index Face in Rekognition
            try {
                await rekognitionClient.send(new client_rekognition_1.IndexFacesCommand({
                    CollectionId: collectionId,
                    Image: {
                        S3Object: {
                            Bucket: S3_BUCKET_NAME,
                            Name: fileKey,
                        },
                    },
                    ExternalImageId: fileKey.replace(/\//g, '_'),
                    MaxFaces: 1,
                    QualityFilter: "AUTO",
                    DetectionAttributes: ["DEFAULT"]
                }));
            }
            catch (rekError) {
                console.error("Rekognition Indexing Error:", rekError);
                throw new Error(`Failed to index face ${i}: ${rekError.message}`);
            }
        }
        // Step 3: Save profile to DB
        const saveQuery = `
            INSERT INTO proctor_profiles (user_id, reference_images, rekognition_collection_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE SET
                reference_images = $2,
                rekognition_collection_id = $3,
                created_at = NOW()
            RETURNING *;
        `;
        await client.query(saveQuery, [studentId, JSON.stringify(uploadedUrls), collectionId]);
        await client.query('COMMIT');
        res.status(200).json({
            message: "Identity successfully enrolled.",
            collectionId: collectionId,
            referenceUrls: uploadedUrls,
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error("Proctoring Enrollment FATAL ERROR:", error);
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
    const { base64Image, submissionId } = req.body;
    if (!studentId)
        return res.status(401).json({ message: "Authentication required." });
    if (!base64Image || !submissionId) {
        return res.status(400).json({ message: "Image and submission ID are required." });
    }
    const client = await db_1.default.connect();
    const HIGH_CONFIDENCE_THRESHOLD = 90;
    const TEST_IMAGE_S3_KEY = `proctor_tests/${studentId}_test_${Date.now()}.jpeg`;
    let flagAction = null;
    let flagReason = 'OK';
    let publicTestUrl = '';
    try {
        await client.query('BEGIN');
        const profileResult = await client.query('SELECT reference_images FROM proctor_profiles WHERE user_id = $1', [studentId]);
        if (profileResult.rows.length === 0 || profileResult.rows[0].reference_images.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                message: "Identity profile not found. Please enroll first.",
                code: "ENROLLMENT_REQUIRED"
            });
        }
        const referenceUrl = profileResult.rows[0].reference_images[0];
        const sourceKey = referenceUrl.split('.com/')[1];
        publicTestUrl = await uploadBase64Image(base64Image, TEST_IMAGE_S3_KEY);
        const compareParams = {
            SourceImage: {
                S3Object: {
                    Bucket: S3_BUCKET_NAME,
                    Name: sourceKey,
                }
            },
            TargetImage: {
                S3Object: {
                    Bucket: S3_BUCKET_NAME,
                    Name: TEST_IMAGE_S3_KEY,
                }
            },
            SimilarityThreshold: HIGH_CONFIDENCE_THRESHOLD,
        };
        const comparison = await rekognitionClient.send(new client_rekognition_1.CompareFacesCommand(compareParams));
        const faceMatch = comparison.FaceMatches?.[0];
        // Analysis Logic
        if (!comparison.FaceMatches?.length && !comparison.UnmatchedFaces?.length) {
            flagAction = 'NO_FACE_DETECTED';
            flagReason = 'No face found in frame.';
        }
        else if (comparison.UnmatchedFaces && comparison.UnmatchedFaces.length > 0) {
            flagAction = 'SUBJECT_MISMATCH';
            const sim = faceMatch ? faceMatch.Similarity : 0;
            flagReason = `Face mismatch. Similarity: ${sim?.toFixed(1)}%`;
        }
        if (flagAction) {
            await logAudit(flagAction, flagReason, studentId, undefined);
            await client.query(`
                INSERT INTO proctor_flags (submission_id, student_id, type, image_url, warning_count, analysis_data)
                VALUES ($1, $2, $3, $4, 1, $5)
                ON CONFLICT DO NOTHING;
            `, [
                submissionId,
                studentId,
                flagAction,
                publicTestUrl,
                JSON.stringify({ reason: flagReason, confidence: faceMatch?.Similarity || 0 })
            ]);
        }
        await client.query('COMMIT');
        res.status(200).json({ status: flagAction ? 'FLAGGED' : 'VERIFIED' });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error("Image Analysis Error:", error);
        res.status(500).json({ message: `Analysis failed: ${error.message}` });
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
    const { submissionId, violationType } = req.body;
    const MAX_WARNINGS = 3;
    if (!studentId)
        return res.status(401).json({ message: "Authentication required." });
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
            return res.status(404).json({ message: "Exam not active." });
        }
        const currentWarnings = submission.warning_count || 0;
        const newWarnings = currentWarnings + 1;
        await client.query(`
            INSERT INTO proctor_flags (submission_id, student_id, type, warning_count, analysis_data)
            VALUES ($1, $2, $3, $4, $5);
        `, [submissionId, studentId, violationType, newWarnings, JSON.stringify({ reason: violationType })]);
        if (newWarnings >= MAX_WARNINGS) {
            await client.query(`
                UPDATE exam_submissions 
                SET status = 'submitted_auto', submitted_at = NOW(), warning_count = $1 
                WHERE id = $2;
            `, [newWarnings, submissionId]);
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
        console.error("Violation Error:", error);
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
        LIMIT 5;
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
        console.error("Error in getLiveProctorCandidates:", err);
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
                return res.status(403).json({ message: 'Forbidden: Exam does not belong to your organization.' });
            }
            // Strict ownership check: only the creator can view proctoring data
            if (!ownsExam) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to access this exam.' });
            }
        }
        const stats = await getExamProctoringStats(examId);
        const alerts = await getProctorAlerts(examId);
        const candidates = await getLiveProctorCandidates(examId);
        const detectionChartData = {
            labels: ['Multiple Faces', 'Tab Switching', 'Inactivity', 'Face Blurred', 'No Face Detected'],
            data: [45, 78, 23, 34, 12],
        };
        const threatChartData = {
            labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30'],
            critical: [2, 3, 1, 4, 3, 2, 3],
            high: [5, 7, 6, 8, 7, 6, 8],
            medium: [8, 10, 9, 11, 10, 9, 12],
        };
        res.status(200).json({
            metrics: stats,
            alerts: alerts,
            candidates: candidates,
            charts: {
                detection: detectionChartData,
                threatLevel: threatChartData,
            }
        });
    }
    catch (error) {
        console.error("Error fetching proctoring dashboard data:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: 'Internal server error while loading dashboard data.', error: error.message });
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
        return res.status(400).json({ message: "Organization ID required." });
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
        console.error("Error fetching organization proctoring overview:", error);
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
        return res.status(401).json({ message: "Authentication required." });
    try {
        const result = await db_1.default.query('SELECT 1 FROM proctor_profiles WHERE user_id = $1', [studentId]);
        res.status(200).json({
            enrolled: result.rows.length > 0
        });
    }
    catch (error) {
        console.error("Error checking proctoring status:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.getProctoringStatus = getProctoringStatus;
