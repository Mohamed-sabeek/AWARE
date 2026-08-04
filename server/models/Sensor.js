import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  aqi: {
    type: Number,
    required: true,
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
