import express from 'express';
import {
  getActivityLogs,
  getLatestActivityLogs,
  getActivityLogStats
} from '../controllers/activityLogController.js';
import { protect, authorityOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorityOrAdmin);

router.get('/', getActivityLogs);
router.get('/latest', getLatestActivityLogs);
router.get('/statistics', getActivityLogStats);

export default router;
