import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  getEvidences,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence
} from '../controllers/evidenceController.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getEvidences)
  .post(protect, upload.single('image'), createEvidence);

router.route('/:id')
  .get(protect, admin, getEvidenceById)
  .put(protect, admin, updateEvidence)
  .delete(protect, admin, deleteEvidence);

export default router;
