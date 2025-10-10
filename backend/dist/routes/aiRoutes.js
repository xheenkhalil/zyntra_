"use strict";
// /backend/src/routes/aiRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for in-memory file storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// All routes are for Course Admins
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
// Route for topic-based generation
router.post('/generate-questions', aiController_1.generateAiQuestions);
// NEW Route for document-based generation
// The 'upload.single('document')' middleware will process the file upload first
router.post('/generate-from-document', upload.single('document'), aiController_1.generateFromDocument);
exports.default = router;
