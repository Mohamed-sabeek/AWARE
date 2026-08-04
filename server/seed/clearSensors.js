import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sensor from '../models/Sensor.js';

dotenv.config();

const clearSensors = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Sensor.deleteMany();
    console.log('Existing sensors cleared.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearSensors();
