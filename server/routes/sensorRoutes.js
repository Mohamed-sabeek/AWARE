import express from 'express';
import {
  getSensors,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor
} from '../controllers/sensorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getSensors)
  .post(protect, admin, createSensor);

router.route('/:id')
  .get(protect, admin, getSensorById)
  .put(updateSensor) // Allow hardware nodes to update without JWT for now, or add an API key middleware later
  .delete(protect, admin, deleteSensor);

export default router;
