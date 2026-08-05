import express from 'express';
import {
  getOverview,
  getTrends,
  getDistribution,
  getSensorPerformance,
  getEvidenceStats,
  getAlertStats,
  getDeviceHealth,
  getInsights,
  getPeakHours
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect, admin);

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/distribution', getDistribution);
router.get('/sensors', getSensorPerformance);
router.get('/evidence', getEvidenceStats);
router.get('/alerts', getAlertStats);
router.get('/device', getDeviceHealth);
router.get('/insights', getInsights);
router.get('/peak-hours', getPeakHours);

export default router;
