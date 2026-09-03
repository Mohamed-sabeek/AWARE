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
  incidentStatus: {
    type: String,
    enum: ['NEW', 'ASSIGNED', 'ACKNOWLEDGED', 'UNDER INVESTIGATION', 'RESOLVED'],
    default: 'NEW'
  },

  // Incident Assignment Fields
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedOfficerName: {
    type: String,
    default: null
  },
  assignedOfficerRole: {
    type: String,
    enum: ['fire_officer', 'pollution_officer', null],
    default: null
  },
  assignedDepartment: {
    type: String,
    enum: ['FIRE_OFFICER', 'POLLUTION_OFFICER', null],
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedByName: {
    type: String,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  assignmentNotes: {
    type: String,
    default: ''
  },

  // Officer Investigation & Resolution Fields
  investigationNotes: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolutionImageUrl: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedByName: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
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
