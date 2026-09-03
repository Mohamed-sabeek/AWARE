import express from 'express';
import { protect, admin, authorityOrAdmin, anyOfficerOrAdmin, fieldOfficer } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import diskUpload from '../middleware/diskUpload.js';
import {
  getEvidences,
  getEvidenceStats,
  getEvidenceById,
  assignIncident,
  updateIncidentStatus,
  saveInvestigationNotes,
  resolveIncidentWithEvidence,
  captureEvidence,
  deleteEvidence
} from '../controllers/evidenceController.js';

const router = express.Router();

// Hardware ESP32-CAM Image Upload Endpoint (Public ingestion from IoT camera)
router.post('/upload', diskUpload.single('image'), captureEvidence);
router.post('/capture', diskUpload.single('image'), captureEvidence);

// System-wide and Role-filtered statistics
router.get('/stats', protect, anyOfficerOrAdmin, getEvidenceStats);

// Incident Assignment (Authority / Admin only)
router.post('/:id/assign', protect, authorityOrAdmin, assignIncident);
router.put('/:id/assign', protect, authorityOrAdmin, assignIncident);

// Field Officer operational status transitions & notes
router.put('/:id/incident-status', protect, anyOfficerOrAdmin, updateIncidentStatus);
router.put('/:id/notes', protect, anyOfficerOrAdmin, saveInvestigationNotes);
router.post('/:id/resolve', protect, anyOfficerOrAdmin, resolveIncidentWithEvidence);

router.route('/')
  .get(protect, anyOfficerOrAdmin, getEvidences)
  .post(protect, admin, upload.single('image'), captureEvidence);

router.route('/:id')
  .get(protect, anyOfficerOrAdmin, getEvidenceById)
  .delete(protect, admin, deleteEvidence);

export default router;
