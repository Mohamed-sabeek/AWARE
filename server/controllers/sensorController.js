import Sensor from '../models/Sensor.js';
import SensorReading from '../models/SensorReading.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all sensors
// @route   GET /api/sensors
// @access  Private/Admin
export const getSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({});
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single sensor by ID
// @route   GET /api/sensors/:id
// @access  Private/Admin
export const getSensorById = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (sensor) {
      res.json(sensor);
    } else {
      res.status(404).json({ message: 'Sensor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new sensor
// @route   POST /api/sensors
// @access  Private/Admin
export const createSensor = async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    const createdSensor = await sensor.save();

    await ActivityLog.create({
      deviceName: createdSensor.location || 'ESP32 Sensor',
      deviceId: createdSensor.sensorId,
      category: 'Hardware',
      severity: 'Info',
      description: `New hardware node registered: ${createdSensor.sensorId}`,
      location: createdSensor.location
    });

    res.status(201).json(createdSensor);
  } catch (error) {
    res.status(400).json({ message: 'Invalid sensor data', error: error.message });
  }
};

// @desc    Update a sensor
// @route   PUT /api/sensors/:id
// @access  Private/Admin (and Hardware Node)
export const updateSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);

    if (sensor) {
      const prevStatus = sensor.status;
      sensor.sensorId = req.body.sensorId || sensor.sensorId;
      sensor.latitude = req.body.latitude || sensor.latitude;
      sensor.longitude = req.body.longitude || sensor.longitude;
      sensor.location = req.body.location || sensor.location;
      sensor.aqi = req.body.aqi !== undefined ? req.body.aqi : sensor.aqi;
      sensor.pm25 = req.body.pm25 !== undefined ? req.body.pm25 : sensor.pm25;
      sensor.pm10 = req.body.pm10 !== undefined ? req.body.pm10 : sensor.pm10;
      sensor.mq135 = req.body.mq135 !== undefined ? req.body.mq135 : sensor.mq135;
      sensor.temperature = req.body.temperature !== undefined ? req.body.temperature : sensor.temperature;
      sensor.humidity = req.body.humidity !== undefined ? req.body.humidity : sensor.humidity;
      sensor.status = req.body.status || sensor.status;
      sensor.detectionType = req.body.detectionType || sensor.detectionType;
      sensor.cameraId = req.body.cameraId || sensor.cameraId;
      sensor.lastUpdated = Date.now();

      const updatedSensor = await sensor.save();

      // Log status change
      if (prevStatus !== updatedSensor.status) {
        await ActivityLog.create({
          deviceName: updatedSensor.location || 'ESP32 Sensor',
          deviceId: updatedSensor.sensorId,
          category: 'Hardware',
          severity: updatedSensor.status === 'Online' ? 'Success' : (updatedSensor.status === 'Offline' ? 'Warning' : 'Info'),
          description: `Device status changed to ${updatedSensor.status}`,
          location: updatedSensor.location
        });
      }

      // Log high AQI or alerts if crossed thresholds
      if (req.body.aqi !== undefined && req.body.aqi > 150) {
        await ActivityLog.create({
          deviceName: updatedSensor.location || 'ESP32 Sensor',
          deviceId: updatedSensor.sensorId,
          category: 'Alert',
          severity: req.body.aqi > 200 ? 'Critical' : 'Warning',
          description: `High AQI (${req.body.aqi}) detected at ${updatedSensor.location}`,
          location: updatedSensor.location,
          metadata: { aqi: req.body.aqi }
        });
      }

      // Log historical reading for analytics
      if (req.body.aqi !== undefined || req.body.pm25 !== undefined || req.body.pm10 !== undefined) {
        await SensorReading.create({
          sensorId: sensor.sensorId,
          aqi: req.body.aqi !== undefined ? req.body.aqi : sensor.aqi,
          pm25: req.body.pm25 || 0,
          pm10: req.body.pm10 || 0,
          mq135: req.body.mq135 || 0,
          temperature: req.body.temperature || 0,
          humidity: req.body.humidity || 0,
        });
        
        // Occasionally log sensor data received (to avoid spamming, we just log significant changes or randomly for demo? No demo. Just log if it's a new incident)
        if (req.body.detectionType && req.body.detectionType !== 'None') {
           await ActivityLog.create({
             deviceName: updatedSensor.location || 'ESP32-CAM',
             deviceId: updatedSensor.sensorId,
             category: 'Sensor',
             severity: 'Warning',
             description: `${req.body.detectionType} signature detected`,
             location: updatedSensor.location,
             metadata: { detectionType: req.body.detectionType }
           });
        }
      }

      res.json(updatedSensor);
    } else {
      res.status(404).json({ message: 'Sensor not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
};

// @desc    Delete a sensor
// @route   DELETE /api/sensors/:id
// @access  Private/Admin
export const deleteSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (sensor) {
      await Sensor.deleteOne({ _id: sensor._id });
      res.json({ message: 'Sensor removed' });
    } else {
      res.status(404).json({ message: 'Sensor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
