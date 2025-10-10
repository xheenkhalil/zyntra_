"use strict";
// /backend/src/routes/questionRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionController_1 = require("../controllers/questionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All question actions are for Course Admins
router.use(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('courseadmin'));
router.route('/:questionId')
    .put(questionController_1.updateQuestion)
    .delete(questionController_1.deleteQuestion);
exports.default = router;
