"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storageService_1 = require("../services/storageService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/image', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const imageUrl = await (0, storageService_1.uploadFileToR2)(req.file.buffer, req.file.originalname, req.file.mimetype);
        res.json({ url: imageUrl });
    }
    catch (error) {
        console.error('Image upload failed', error);
        res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
});
exports.default = router;
