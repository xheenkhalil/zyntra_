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

// Public / User Routes
router.get('/', getCertifications);
router.get('/:id', getCertificationById);

// Protected User Routes (Enrollment & Progress)
router.post('/:id/enroll', protect, enrollUser);
router.get('/:id/enrollment', protect, getEnrollmentStatus);
router.post('/units/:unit_id/complete', protect, markUnitCompleted);
router.get('/modules/:moduleId/assessment', protect, getModuleAssessment);
router.post('/:certification_id/modules/:moduleId/assessment', protect, submitModuleAssessment);

// Admin Routes
router.post('/', protect, authorize('superadmin'), createCertification);
router.put('/:id', protect, authorize('superadmin'), updateCertification);
router.delete('/:id', protect, authorize('superadmin'), deleteCertification);

export default router;
