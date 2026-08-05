import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true // Index for faster queries in Analytics
  },
  aqi: {
    type: Number,
    required: true
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
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index for time-series queries
  }
}, { timestamps: false });

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

export default SensorReading;
