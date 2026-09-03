import express from 'express';
import { protect, admin, authorityOrAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import diskUpload from '../middleware/diskUpload.js';
import {
  getEvidences,
  getEvidenceStats,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  uploadEvidenceFromDevice,
  updateIncidentStatus
} from '../controllers/evidenceController.js';

const router = express.Router();

// Hardware ESP32-CAM Image Upload Endpoint (Public ingestion)
router.post('/upload', diskUpload.single('image'), uploadEvidenceFromDevice);

// System-wide statistics for Authority / Admin KPIs
router.get('/stats', protect, authorityOrAdmin, getEvidenceStats);

router.route('/')
  .get(protect, authorityOrAdmin, getEvidences)
  .post(protect, upload.single('image'), createEvidence);

router.put('/:id/incident-status', protect, authorityOrAdmin, updateIncidentStatus);

router.route('/:id')
  .get(protect, authorityOrAdmin, getEvidenceById)
  .put(protect, admin, updateEvidence)
  .delete(protect, admin, deleteEvidence);

export default router;
