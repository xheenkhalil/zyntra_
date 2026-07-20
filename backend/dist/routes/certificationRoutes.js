"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const certificationController_1 = require("../controllers/certificationController");
const router = (0, express_1.Router)();
// Public / User Routes
router.get('/', certificationController_1.getCertifications);
router.get('/:id', certificationController_1.getCertificationById);
// Protected User Routes (Enrollment & Progress)
router.post('/:id/enroll', authMiddleware_1.protect, certificationController_1.enrollUser);
router.get('/:id/enrollment', authMiddleware_1.protect, certificationController_1.getEnrollmentStatus);
router.post('/units/:unit_id/complete', authMiddleware_1.protect, certificationController_1.markUnitCompleted);
router.get('/modules/:moduleId/assessment', authMiddleware_1.protect, certificationController_1.getModuleAssessment);
router.post('/:certification_id/modules/:moduleId/assessment', authMiddleware_1.protect, certificationController_1.submitModuleAssessment);
// Admin Routes
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'), certificationController_1.createCertification);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'), certificationController_1.updateCertification);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('superadmin'), certificationController_1.deleteCertification);
exports.default = router;
