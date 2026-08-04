import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aware';
    
    // Connect to database
    await mongoose.connect(uri);
    console.log(`MongoDB Connected for Seeding: ${mongoose.connection.host}`);

    const adminEmail = 'awareadmin@gmail.com';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seeding.');
      process.exit(0);
    }

    // Create the default admin user
    const adminUser = new User({
      fullName: 'AWARE Administrator',
      email: adminEmail,
      phoneNumber: '6383028607',
      password: 'aware@admin',
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();

    console.log('Admin user seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
