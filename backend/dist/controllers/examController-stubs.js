"use strict";
// backend/src/controllers/examController-stubs.ts
// Temporary stub implementations for missing functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreExam = exports.archiveExam = exports.deleteQuestion = exports.updateQuestionInExam = void 0;
const updateQuestionInExam = async (req, res) => {
    res.status(501).json({ message: 'Update question not yet fully implemented' });
};
exports.updateQuestionInExam = updateQuestionInExam;
const deleteQuestion = async (req, res) => {
    res.status(501).json({ message: 'Delete question not yet fully implemented' });
};
exports.deleteQuestion = deleteQuestion;
const archiveExam = async (req, res) => {
    res.status(501).json({ message: 'Archive exam not yet fully implemented' });
};
exports.archiveExam = archiveExam;
const restoreExam = async (req, res) => {
    res.status(501).json({ message: 'Restore exam not yet fully implemented' });
};
exports.restoreExam = restoreExam;
