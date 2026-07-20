"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitModuleAssessment = exports.getModuleAssessment = exports.markUnitCompleted = exports.getEnrollmentStatus = exports.enrollUser = exports.deleteCertification = exports.updateCertification = exports.createCertification = exports.getCertificationById = exports.getCertifications = void 0;
const db_1 = __importDefault(require("../services/db"));
const getCertifications = async (req, res) => {
    try {
        const { rows } = await db_1.default.query('SELECT * FROM certifications ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching certifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCertifications = getCertifications;
const getCertificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const certResult = await db_1.default.query('SELECT * FROM certifications WHERE id = $1', [id]);
        if (certResult.rows.length === 0) {
            return res.status(404).json({ error: 'Certification not found' });
        }
        const certification = certResult.rows[0];
        const modulesResult = await db_1.default.query('SELECT * FROM certification_modules WHERE certification_id = $1 ORDER BY order_index ASC', [id]);
        const modules = modulesResult.rows;
        if (modules.length > 0) {
            const moduleIds = modules.map(m => m.id);
            const unitsResult = await db_1.default.query('SELECT * FROM certification_units WHERE module_id = ANY($1) ORDER BY order_index ASC', [moduleIds]);
            const units = unitsResult.rows;
            modules.forEach(m => {
                m.units = units.filter(u => u.module_id === m.id);
            });
        }
        certification.modules = modules;
        res.json(certification);
    }
    catch (error) {
        console.error('Error fetching certification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCertificationById = getCertificationById;
const createCertification = async (req, res) => {
    try {
        const { title, description, overview, price, image_url, is_published, modules } = req.body;
        await db_1.default.query('BEGIN');
        const certResult = await db_1.default.query('INSERT INTO certifications (title, description, overview, price, image_url, is_published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [title, description, overview, price || 0, image_url, is_published || false]);
        const certification = certResult.rows[0];
        if (modules && Array.isArray(modules)) {
            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                const modResult = await db_1.default.query('INSERT INTO certification_modules (certification_id, title, order_index, has_assessment, passing_rate, assessment_question_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [certification.id, mod.title, i, mod.has_assessment || false, mod.passing_rate || 80.0, mod.assessment_question_count || 5]);
                const newMod = modResult.rows[0];
                if (mod.units && Array.isArray(mod.units)) {
                    for (let j = 0; j < mod.units.length; j++) {
                        const unit = mod.units[j];
                        await db_1.default.query('INSERT INTO certification_units (module_id, title, content, video_url, order_index) VALUES ($1, $2, $3, $4, $5)', [newMod.id, unit.title, unit.content, unit.video_url, j]);
                    }
                }
            }
        }
        await db_1.default.query('COMMIT');
        res.status(201).json(certification);
    }
    catch (error) {
        await db_1.default.query('ROLLBACK');
        console.error('Error creating certification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createCertification = createCertification;
const updateCertification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, overview, price, image_url, is_published, modules } = req.body;
        await db_1.default.query('BEGIN');
        const certResult = await db_1.default.query('UPDATE certifications SET title = $1, description = $2, overview = $3, price = $4, image_url = $5, is_published = $6, updated_at = now() WHERE id = $7 RETURNING *', [title, description, overview, price, image_url, is_published, id]);
        if (certResult.rows.length === 0) {
            await db_1.default.query('ROLLBACK');
            return res.status(404).json({ error: 'Certification not found' });
        }
        // For simplicity, if modules are provided, delete old ones and insert new ones
        if (modules) {
            await db_1.default.query('DELETE FROM certification_modules WHERE certification_id = $1', [id]);
            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                const modResult = await db_1.default.query('INSERT INTO certification_modules (certification_id, title, order_index, has_assessment, passing_rate, assessment_question_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, mod.title, i, mod.has_assessment || false, mod.passing_rate || 80.0, mod.assessment_question_count || 5]);
                const newMod = modResult.rows[0];
                if (mod.units && Array.isArray(mod.units)) {
                    for (let j = 0; j < mod.units.length; j++) {
                        const unit = mod.units[j];
                        await db_1.default.query('INSERT INTO certification_units (module_id, title, content, video_url, order_index) VALUES ($1, $2, $3, $4, $5)', [newMod.id, unit.title, unit.content, unit.video_url, j]);
                    }
                }
            }
        }
        await db_1.default.query('COMMIT');
        res.json(certResult.rows[0]);
    }
    catch (error) {
        await db_1.default.query('ROLLBACK');
        console.error('Error updating certification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCertification = updateCertification;
const deleteCertification = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.query('DELETE FROM certifications WHERE id = $1', [id]);
        res.json({ message: 'Certification deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting certification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteCertification = deleteCertification;
// --- Progress Tracking Endpoints ---
const enrollUser = async (req, res) => {
    try {
        const { id: certification_id } = req.params;
        // @ts-ignore
        const user_id = req.user.id;
        const result = await db_1.default.query('INSERT INTO certification_enrollments (user_id, certification_id) VALUES ($1, $2) ON CONFLICT (user_id, certification_id) DO NOTHING RETURNING *', [user_id, certification_id]);
        res.status(201).json(result.rows[0] || { message: 'Already enrolled' });
    }
    catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.enrollUser = enrollUser;
const getEnrollmentStatus = async (req, res) => {
    try {
        const { id: certification_id } = req.params;
        // @ts-ignore
        const user_id = req.user.id;
        const enrollResult = await db_1.default.query('SELECT * FROM certification_enrollments WHERE user_id = $1 AND certification_id = $2', [user_id, certification_id]);
        if (enrollResult.rows.length === 0) {
            return res.json({ enrolled: false });
        }
        const progressResult = await db_1.default.query(`
      SELECT cup.* FROM certification_unit_progress cup
      JOIN certification_units cu ON cu.id = cup.unit_id
      JOIN certification_modules cm ON cm.id = cu.module_id
      WHERE cm.certification_id = $1 AND cup.user_id = $2
    `, [certification_id, user_id]);
        const moduleProgressResult = await db_1.default.query(`
      SELECT cmp.* FROM certification_module_progress cmp
      JOIN certification_enrollments ce ON ce.id = cmp.enrollment_id
      WHERE ce.certification_id = $1 AND ce.user_id = $2
    `, [certification_id, user_id]);
        res.json({
            enrolled: true,
            enrollment: enrollResult.rows[0],
            completed_units: progressResult.rows.filter(r => r.is_completed).map(r => r.unit_id),
            module_progress: moduleProgressResult.rows
        });
    }
    catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getEnrollmentStatus = getEnrollmentStatus;
const markUnitCompleted = async (req, res) => {
    try {
        const { unit_id } = req.params;
        const { is_completed } = req.body;
        // @ts-ignore
        const user_id = req.user.id;
        await db_1.default.query(`
      INSERT INTO certification_unit_progress (user_id, unit_id, is_completed, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, unit_id) 
      DO UPDATE SET is_completed = $3, completed_at = $4
    `, [user_id, unit_id, is_completed, is_completed ? new Date() : null]);
        // Recalculate progress logic here if needed (omitted for brevity, could be done async)
        res.json({ message: 'Unit progress updated' });
    }
    catch (error) {
        console.error('Error updating unit progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markUnitCompleted = markUnitCompleted;
const getModuleAssessment = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const questionsResult = await db_1.default.query('SELECT id, question_text, options FROM certification_module_questions WHERE module_id = $1', [moduleId]);
        // Strip isCorrect before sending to client
        const sanitizedQuestions = questionsResult.rows.map(q => {
            let safeOptions = [];
            if (typeof q.options === 'string') {
                try {
                    safeOptions = JSON.parse(q.options);
                }
                catch (e) { }
            }
            else if (Array.isArray(q.options)) {
                safeOptions = q.options;
            }
            return {
                ...q,
                options: safeOptions.map((opt) => ({ text: opt.text }))
            };
        });
        res.json(sanitizedQuestions);
    }
    catch (error) {
        console.error('Error fetching module assessment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getModuleAssessment = getModuleAssessment;
const submitModuleAssessment = async (req, res) => {
    try {
        const { certification_id, moduleId } = req.params;
        const { answers } = req.body; // { questionId: "selected text" }
        // @ts-ignore
        const user_id = req.user.id;
        const enrollResult = await db_1.default.query('SELECT id FROM certification_enrollments WHERE user_id = $1 AND certification_id = $2', [user_id, certification_id]);
        if (enrollResult.rows.length === 0)
            return res.status(403).json({ error: 'Not enrolled' });
        const enrollment_id = enrollResult.rows[0].id;
        const moduleResult = await db_1.default.query('SELECT passing_rate FROM certification_modules WHERE id = $1', [moduleId]);
        if (moduleResult.rows.length === 0)
            return res.status(404).json({ error: 'Module not found' });
        const passing_rate = parseFloat(moduleResult.rows[0].passing_rate || '80.0');
        // Check attempts
        const progressResult = await db_1.default.query('SELECT * FROM certification_module_progress WHERE enrollment_id = $1 AND module_id = $2', [enrollment_id, moduleId]);
        let attempts = 0;
        if (progressResult.rows.length > 0) {
            attempts = progressResult.rows[0].attempts;
            if (progressResult.rows[0].passed) {
                return res.status(400).json({ error: 'Assessment already passed.' });
            }
            if (attempts >= 3) {
                return res.status(403).json({ error: 'Maximum attempts reached.' });
            }
        }
        const questionsResult = await db_1.default.query('SELECT id, options FROM certification_module_questions WHERE module_id = $1', [moduleId]);
        const questions = questionsResult.rows;
        let correctCount = 0;
        for (const q of questions) {
            const selectedText = answers[q.id];
            let opts = [];
            if (typeof q.options === 'string') {
                try {
                    opts = JSON.parse(q.options);
                }
                catch (e) { }
            }
            else {
                opts = q.options;
            }
            const correctOpt = opts.find((o) => o.isCorrect);
            if (correctOpt && selectedText && correctOpt.text === selectedText) {
                correctCount++;
            }
        }
        const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
        const passed = score >= passing_rate;
        await db_1.default.query(`
      INSERT INTO certification_module_progress (enrollment_id, module_id, passed, score, attempts, updated_at)
      VALUES ($1, $2, $3, $4, 1, now())
      ON CONFLICT (enrollment_id, module_id)
      DO UPDATE SET passed = $3, score = $4, attempts = certification_module_progress.attempts + 1, updated_at = now()
    `, [enrollment_id, moduleId, passed, score]);
        res.json({ passed, score, correctCount, total: questions.length, attempts: attempts + 1 });
    }
    catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitModuleAssessment = submitModuleAssessment;
