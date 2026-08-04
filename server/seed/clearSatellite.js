import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SatelliteObservation from '../models/SatelliteObservation.js';

dotenv.config();

const clearSatellite = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    await SatelliteObservation.deleteMany();
    console.log('All satellite observations cleared.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearSatellite();
