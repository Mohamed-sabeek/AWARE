import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // In a real app we'd use process.env.MONGO_URI, but this is a landing page mock backend
    // If not provided, we will just simulate a connection or connect to a local fallback
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aware';
    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
