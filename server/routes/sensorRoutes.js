import express from 'express';
import {
  getSensors,
  getSensorById,
  createSensor,
  updateSensor,
  updateSensorLocation,
  deleteSensor,
  recordSensorReading,
  getSensorReadings
} from '../controllers/sensorController.js';
import { protect, admin, authorityOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Hardware Sensor Ingestion Endpoint (Public / Device accessible)
router.post('/reading', recordSensorReading);

// Historical readings for a specific sensor (e.g. GET /api/sensors/ESP32-CAM-001/readings?limit=50)
router.get('/:sensorId/readings', getSensorReadings);

// Dedicated sensor fixed location endpoints (Admin protected)
router.put('/location', protect, admin, updateSensorLocation);
router.put('/:id/location', protect, admin, updateSensorLocation);

router.route('/')
  .get(protect, authorityOrAdmin, getSensors)
  .post(protect, admin, createSensor);

router.route('/:id')
  .get(protect, admin, getSensorById)
  .put(updateSensor) // Allow hardware nodes to update without JWT for now, or add an API key middleware later
  .delete(protect, admin, deleteSensor);

export default router;
