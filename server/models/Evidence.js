import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: false,
    default: ''
  },
  voltage: {
    type: Number,
    default: 0
  },
  detectionType: {
    type: String,
    required: true,
    enum: ['Smoke', 'Fire', 'Deforestation', 'Illegal Mining', 'Threshold Exceeded', 'Monitoring Snapshot', 'Other'],
    default: 'Threshold Exceeded'
  },
  aqi: {
    type: Number,
    required: false,
    default: 0,
    min: 0
  },
  confidence: {
    type: Number,
    required: false,
    default: 95,
    min: 0,
    max: 100
  },
  locationName: {
    type: String,
    required: false,
    default: null
  },
  location: {
    type: String,
    required: false,
    default: null
  },
  latitude: {
    type: Number,
    required: false,
    default: null
  },
  longitude: {
    type: Number,
    required: false,
    default: null
  },
  sensorId: {
    type: String,
    required: true,
    default: 'ESP32-CAM-001'
  },
  cameraId: {
    type: String,
    required: false,
    default: 'ESP32-CAM-001'
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Report Generated'],
    default: 'Verified'
  },
  reportStatus: {
    type: String,
    enum: ['Not Generated', 'Generated', 'Sent'],
    default: 'Not Generated'
  },
  emailStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Failed'],
    default: 'Not Sent'
  }
}, { timestamps: true });

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;
