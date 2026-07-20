import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
  getCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
  enrollUser,
  getEnrollmentStatus,
  markUnitCompleted,
  getModuleAssessment,
  submitModuleAssessment
} from '../controllers/certificationController';

const router = Router();

// Public Routes
router.get('/', getCertifications);

// Protected User Routes (Enrollment & Progress) — MUST come before /:id
router.get('/modules/:moduleId/assessment', protect, getModuleAssessment);
router.post('/units/:unit_id/complete', protect, markUnitCompleted);

// This must come AFTER /modules/ and /units/ routes to avoid catching them
router.get('/:id', getCertificationById);

router.post('/:id/enroll', protect, enrollUser);
router.get('/:id/enrollment', protect, getEnrollmentStatus);
router.post('/:certification_id/modules/:moduleId/assessment', protect, submitModuleAssessment);

// Admin Routes
router.post('/', protect, authorize('superadmin'), createCertification);
router.put('/:id', protect, authorize('superadmin'), updateCertification);
router.delete('/:id', protect, authorize('superadmin'), deleteCertification);

export default router;
