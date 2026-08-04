import Sensor from '../models/Sensor.js';

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
      sensor.sensorId = req.body.sensorId || sensor.sensorId;
      sensor.latitude = req.body.latitude || sensor.latitude;
      sensor.longitude = req.body.longitude || sensor.longitude;
      sensor.location = req.body.location || sensor.location;
      sensor.aqi = req.body.aqi !== undefined ? req.body.aqi : sensor.aqi;
      sensor.status = req.body.status || sensor.status;
      sensor.detectionType = req.body.detectionType || sensor.detectionType;
      sensor.cameraId = req.body.cameraId || sensor.cameraId;
      sensor.lastUpdated = Date.now();

      const updatedSensor = await sensor.save();
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
