import express from 'express';
import {
  getActivityLogs,
  getLatestActivityLogs,
  getActivityLogStats
} from '../controllers/activityLogController.js';
import { protect, anyOfficerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, anyOfficerOrAdmin);

router.get('/', getActivityLogs);
router.get('/latest', getLatestActivityLogs);
router.get('/statistics', getActivityLogStats);

export default router;
