import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  deviceName: {
    type: String,
    default: 'System'
  },
  deviceId: {
    type: String,
    default: 'SYS-000'
  },
  category: {
    type: String,
    enum: ['Hardware', 'Sensor', 'Alert', 'System', 'Evidence'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Info', 'Success', 'Warning', 'Critical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Completed'
  },
  location: {
    type: String,
    default: 'System Wide'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
