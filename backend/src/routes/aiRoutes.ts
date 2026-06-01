// /backend/src/routes/aiRoutes.ts

import { Router } from 'express';
import { generateAiQuestions, generateFromDocument } from '../controllers/aiController';
import { protect, authorize } from '../middleware/authMiddleware';
import multer from 'multer';

const router = Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes are for Course Admins
router.use(protect, authorize('courseadmin'));

// Route for topic-based generation
router.post('/generate-questions', generateAiQuestions);

// NEW Route for document-based generation
// The 'upload.single('document')' middleware will process the file upload first
router.post('/generate-from-document', upload.single('document'), generateFromDocument);

export default router;
