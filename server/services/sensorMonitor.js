import Sensor from '../models/Sensor.js';
import ActivityLog from '../models/ActivityLog.js';

export const startSensorMonitor = () => {
  const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
  const OFFLINE_THRESHOLD_MS = 20000; // 20 seconds without an update means offline

  console.log('Starting sensor offline detection monitor...');

  setInterval(async () => {
    try {
      const thresholdTime = new Date(Date.now() - OFFLINE_THRESHOLD_MS);

      // Find all sensors that are currently 'Online' but haven't been updated recently
      const inactiveSensors = await Sensor.find({
        status: 'Online',
        lastUpdated: { $lt: thresholdTime }
      });

      for (const sensor of inactiveSensors) {
        sensor.status = 'Offline';
        const updatedSensor = await sensor.save();

        // Log the status change
        await ActivityLog.create({
          deviceName: updatedSensor.location || 'ESP32 Sensor',
          deviceId: updatedSensor.sensorId,
          category: 'Hardware',
          severity: 'Warning',
          description: `Device went Offline (No data received for >20s)`,
          location: updatedSensor.location
        });

        console.log(`Sensor ${sensor.sensorId} automatically marked as Offline.`);
      }
    } catch (error) {
      console.error('Error in sensor monitor background job:', error.message);
    }
  }, CHECK_INTERVAL_MS);
};
