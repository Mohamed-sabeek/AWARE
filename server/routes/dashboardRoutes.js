import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getDashboardStats);

export default router;
