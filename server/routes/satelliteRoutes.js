import express from 'express';
import {
  getObservation,
  getMapObservations,
  getHistory,
  getRegions,
  createObservation,
} from '../controllers/satelliteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected — credentials never reach the client
router.use(protect);

router.get('/regions',      getRegions);           // GET /api/satellite/regions
router.get('/observations', getObservation);        // GET /api/satellite/observations?region=&pollutant=&date=
router.get('/map',          getMapObservations);    // GET /api/satellite/map?pollutant=
router.get('/history',      getHistory);            // GET /api/satellite/history?region=&pollutant=&limit=
router.post('/',            createObservation);     // POST /api/satellite

export default router;
