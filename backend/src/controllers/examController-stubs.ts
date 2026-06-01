// backend/src/controllers/examController-stubs.ts
// Temporary stub implementations for missing functions

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

export const updateQuestionInExam = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Update question not yet fully implemented' });
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Delete question not yet fully implemented' });
};

export const archiveExam = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Archive exam not yet fully implemented' });
};

export const restoreExam = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Restore exam not yet fully implemented' });
};
