import mongoose from 'mongoose';
import Sensor from '../models/Sensor.js';
import SensorReading from '../models/SensorReading.js';
import Alert from '../models/Alert.js';
import ActivityLog from '../models/ActivityLog.js';
import { getPublicLiveStreamUrl } from '../services/streamRelayService.js';

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
// @desc    Delete a sensor node registration
// @route   DELETE /api/sensors/:id
// @access  Private/Admin
export const deleteSensor = async (req, res) => {
  try {
    const targetId = (req.params.id || '').trim();
    let sensor = null;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      sensor = await Sensor.findById(targetId);
    }
    if (!sensor) {
      sensor = await Sensor.findOne({ sensorId: targetId });
    }

    if (sensor) {
      const removedId = sensor.sensorId;
      const removedLoc = sensor.locationName || sensor.location;
      
      // Delete ONLY the Sensor registration document
      await Sensor.deleteOne({ _id: sensor._id });

      // Log activity
      await ActivityLog.create({
        deviceName: removedLoc || removedId,
        deviceId: removedId,
        category: 'Hardware',
        severity: 'Warning',
        description: `Sensor node registration permanently removed: ${removedId}`,
        location: removedLoc || 'ESP32 Station'
      });

      return res.status(200).json({ 
        success: true, 
        message: `Sensor node '${removedId}' deleted successfully.` 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: `Sensor '${targetId}' not found.` 
      });
    }
  } catch (error) {
    console.error('Error in deleteSensor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error while deleting sensor node', 
      error: error.message 
    });
  }
};

// @desc    Record a real-time sensor reading from ESP32-CAM (Hardware Ingestion)
// @route   POST /api/sensors/reading
// @access  Public (Hardware Node)
export const recordSensorReading = async (req, res) => {
  try {
    const { deviceId, voltage, timestamp } = req.body;

    // 1. Validate payload
    if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: deviceId is required and must be a non-empty string'
      });
    }

    if (voltage === undefined || voltage === null || typeof voltage !== 'number' || isNaN(voltage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: voltage is required and must be a valid number'
      });
    }

    // Validate or default timestamp
    let readingTimestamp = new Date();
    if (timestamp) {
      const parsedTime = new Date(timestamp);
      if (isNaN(parsedTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payload: timestamp must be a valid ISO date string'
        });
      }
      readingTimestamp = parsedTime;
    }

    const trimmedDeviceId = deviceId.trim();

    // 2. Find or register device
    let sensor = await Sensor.findOne({ sensorId: trimmedDeviceId });
    if (!sensor) {
      sensor = await Sensor.create({
        sensorId: trimmedDeviceId,
        location: 'ESP32 Station',
        latitude: 0,
        longitude: 0,
        voltage: Number(voltage),
        threshold: 0.400,
        status: 'Online',
        lastUpdated: readingTimestamp
      });

      await ActivityLog.create({
        deviceName: sensor.location || sensor.sensorId,
        deviceId: sensor.sensorId,
        category: 'Hardware',
        severity: 'Info',
        description: `Hardware node registered: ${sensor.sensorId}`,
        location: sensor.location
      });
    } else {
      sensor.voltage = Number(voltage);
      sensor.status = 'Online';
      sensor.lastUpdated = readingTimestamp;
      await sensor.save();
    }

    // 3. Store historical reading for analytics & charts
    await SensorReading.create({
      sensorId: sensor.sensorId,
      voltage: Number(voltage),
      timestamp: readingTimestamp
    });

    // 4. Threshold & Alert Deduplication Logic
    const threshold = sensor.threshold !== undefined && sensor.threshold !== null ? sensor.threshold : 0.400;
    let createdAlert = null;

    if (voltage >= threshold) {
      // De-duplicate: check if an Active alert already exists for this sensor
      const existingActiveAlert = await Alert.findOne({
        sensorId: sensor.sensorId,
        status: 'Active'
      });

      if (!existingActiveAlert) {
        createdAlert = await Alert.create({
          sensorId: sensor.sensorId,
          type: 'Threshold Exceeded',
          severity: 'Critical',
          message: `Gas sensor voltage (${Number(voltage).toFixed(3)} V) reached or exceeded threshold (${Number(threshold).toFixed(3)} V) on device ${sensor.sensorId}.`,
          timestamp: readingTimestamp,
          status: 'Active'
        });

        await ActivityLog.create({
          deviceName: sensor.location || sensor.sensorId,
          deviceId: sensor.sensorId,
          category: 'Alert',
          severity: 'Critical',
          description: `🚨 Threshold Exceeded: Voltage ${Number(voltage).toFixed(3)} V >= ${Number(threshold).toFixed(3)} V`,
          location: sensor.location || 'ESP32 Station',
          metadata: {
            voltage: Number(voltage),
            threshold: Number(threshold),
            alertId: createdAlert._id
          }
        });
      }
    } else {
      // Voltage is within safe limits (< threshold): resolve any active alert on this sensor
      const activeAlert = await Alert.findOne({
        sensorId: sensor.sensorId,
        status: 'Active'
      });

      if (activeAlert) {
        activeAlert.status = 'Resolved';
        await activeAlert.save();

        await ActivityLog.create({
          deviceName: sensor.location || sensor.sensorId,
          deviceId: sensor.sensorId,
          category: 'Alert',
          severity: 'Success',
          description: `Threshold Restored: Voltage (${Number(voltage).toFixed(3)} V) returned to normal (< ${Number(threshold).toFixed(3)} V)`,
          location: sensor.location || 'ESP32 Station',
          metadata: {
            voltage: Number(voltage),
            threshold: Number(threshold)
          }
        });
      }
    }

    // 5. Broadcast real-time events via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('sensor-reading', {
        deviceId: sensor.sensorId,
        voltage: Number(voltage),
        threshold: Number(threshold),
        status: voltage >= threshold ? 'ALERT' : 'NORMAL',
        timestamp: readingTimestamp.toISOString()
      });

      if (createdAlert) {
        io.emit('sensor-alert', {
          alertId: createdAlert._id,
          deviceId: sensor.sensorId,
          voltage: Number(voltage),
          threshold: Number(threshold),
          severity: createdAlert.severity,
          message: createdAlert.message,
          liveStreamUrl: getPublicLiveStreamUrl(sensor.sensorId),
          timestamp: createdAlert.timestamp
        });
      }
    }

    // 6. Return response
    return res.status(200).json({
      success: true,
      message: 'Sensor reading recorded',
      data: {
        deviceId: sensor.sensorId,
        voltage: Number(voltage),
        threshold: Number(threshold),
        status: voltage >= threshold ? 'ALERT' : 'NORMAL',
        timestamp: readingTimestamp.toISOString()
      }
    });

  } catch (error) {
    console.error('Error in recordSensorReading:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while recording sensor reading',
      error: error.message
    });
  }
};

// @desc    Get historical voltage readings for a specific sensor
// @route   GET /api/sensors/:sensorId/readings?limit=50
// @access  Public / Device / Dashboard
export const getSensorReadings = async (req, res) => {
  try {
    const { sensorId } = req.params;

    if (!sensorId || typeof sensorId !== 'string' || !sensorId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sensor ID parameter is required'
      });
    }

    const trimmedId = sensorId.trim();

    // 1. Verify sensor exists
    let sensor = await Sensor.findOne({ sensorId: trimmedId });
    if (!sensor && mongoose.Types.ObjectId.isValid(trimmedId)) {
      sensor = await Sensor.findById(trimmedId);
    }

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: `Sensor '${trimmedId}' not found`
      });
    }

    // 2. Limit parameter handling (default 50, maximum 200)
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 50;
    } else if (limit > 200) {
      limit = 200;
    }

    // 3. Query readings sorted by timestamp descending, limited to requested count
    const readings = await SensorReading.find({ sensorId: sensor.sensorId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('voltage timestamp sensorId -_id')
      .lean();

    // 4. Return in chronological (ascending) order for graph plotting
    const chronologicalReadings = readings.reverse().map(r => ({
      sensorId: r.sensorId,
      voltage: r.voltage !== undefined ? r.voltage : 0,
      timestamp: r.timestamp
    }));

    return res.status(200).json({
      success: true,
      count: chronologicalReadings.length,
      data: chronologicalReadings
    });

  } catch (error) {
    console.error('Error in getSensorReadings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error while fetching sensor readings',
      error: error.message
    });
  }
};

// @desc    Assign or update the fixed physical location of a sensor
// @route   PUT /api/sensors/:id/location or PUT /api/sensors/location
// @access  Private/Admin
export const updateSensorLocation = async (req, res) => {
  try {
    const targetId = req.params.id || req.body.deviceId || req.body.sensorId;
    const { deviceId, sensorId, locationName, location, latitude, longitude } = req.body;

    const identifier = (targetId || deviceId || sensorId || '').trim();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Device/Sensor ID is required'
      });
    }

    const locName = (locationName || location || '').trim();
    if (!locName) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude is required (must be between -90 and 90)'
      });
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid longitude is required (must be between -180 and 180)'
      });
    }

    // Find existing sensor by sensorId or by _id
    let sensor = await Sensor.findOne({ sensorId: identifier });
    if (!sensor && mongoose.Types.ObjectId.isValid(identifier)) {
      sensor = await Sensor.findById(identifier);
    }

    if (!sensor) {
      sensor = new Sensor({
        sensorId: identifier,
        location: locName,
        locationName: locName,
        latitude: lat,
        longitude: lng,
        voltage: 0,
        threshold: 0.400,
        status: 'Online',
        lastUpdated: Date.now()
      });
    } else {
      sensor.location = locName;
      sensor.locationName = locName;
      sensor.latitude = lat;
      sensor.longitude = lng;
      sensor.lastUpdated = Date.now();
    }

    const savedSensor = await sensor.save();

    await ActivityLog.create({
      deviceName: savedSensor.locationName || savedSensor.location || savedSensor.sensorId,
      deviceId: savedSensor.sensorId,
      category: 'Hardware',
      severity: 'Success',
      description: `📍 Fixed location updated: ${savedSensor.locationName} (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
      location: savedSensor.locationName || savedSensor.location
    });

    return res.status(200).json({
      success: true,
      message: `Location saved successfully for ${savedSensor.sensorId}`,
      data: savedSensor
    });

  } catch (error) {
    console.error('Error in updateSensorLocation:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating sensor location',
      error: error.message
    });
  }
};
