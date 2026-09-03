import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true,
    default: 0
  },
  longitude: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    type: String,
    required: true,
    default: 'ESP32 Station'
  },
  locationName: {
    type: String,
    default: 'ESP32 Station'
  },
  voltage: {
    type: Number,
    default: 0
  },
  threshold: {
    type: Number,
    default: 0.400
  },
  aqi: {
    type: Number,
    required: false,
    default: 0
  },
  pm25: {
    type: Number,
    default: 0
  },
  pm10: {
    type: Number,
    default: 0
  },
  mq135: {
    type: Number,
    default: 0
  },
  temperature: {
    type: Number,
    default: 0
  },
  humidity: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Maintenance'],
    default: 'Offline'
  },
  detectionType: {
    type: String,
    enum: ['None', 'Smoke', 'Fire', 'Deforestation', 'Illegal Mining'],
    default: 'None'
  },
  cameraId: {
    type: String,
    default: 'None'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Sensor = mongoose.model('Sensor', sensorSchema);
export default Sensor;
