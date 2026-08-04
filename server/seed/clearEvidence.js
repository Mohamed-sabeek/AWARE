import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Evidence from '../models/Evidence.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Evidence.deleteMany();
    console.log('All evidence data wiped from the database.');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearDatabase();
