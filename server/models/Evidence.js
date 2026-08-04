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
    required: true
  },
  detectionType: {
    type: String,
    required: true,
    enum: ['Smoke', 'Fire', 'Deforestation', 'Illegal Mining', 'Other'],
    default: 'Smoke'
  },
  aqi: {
    type: Number,
    required: true,
    min: 0
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  location: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  sensorId: {
    type: String,
    required: true
  },
  cameraId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Report Generated'],
    default: 'Pending'
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
