import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['High AQI', 'Gas Leak', 'Temperature', 'Evidence', 'System'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'Warning', 'Info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved'],
    default: 'Active'
  }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
