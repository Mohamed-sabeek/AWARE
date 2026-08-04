import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sensor from '../models/Sensor.js';

dotenv.config();

// Tamil Nadu major cities coordinates
const locations = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },
  { name: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
  { name: 'Ranipet', lat: 12.9275, lng: 79.3303 },
  { name: 'Sivakasi', lat: 9.4533, lng: 77.8024 },
  { name: 'Karur', lat: 10.9601, lng: 78.0766 },
  { name: 'Ooty', lat: 11.4102, lng: 76.6950 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
  { name: 'Hosur', lat: 12.7409, lng: 77.8253 },
  { name: 'Nagercoil', lat: 8.1833, lng: 77.4119 },
  { name: 'Kanchipuram', lat: 12.8185, lng: 79.6947 }
];

const detectionTypes = ['None', 'None', 'None', 'Smoke', 'Fire', 'Deforestation', 'Illegal Mining', 'None'];
const statuses = ['Online', 'Online', 'Online', 'Online', 'Offline', 'Maintenance'];

const generateMockSensors = () => {
  return locations.map((loc, index) => {
    // Add small random offset to coordinates so they don't look too grid-like if close
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const detectionType = status === 'Online' ? detectionTypes[Math.floor(Math.random() * detectionTypes.length)] : 'None';
    
    // Higher AQI if smoke or fire detected
    let aqi = Math.floor(Math.random() * 100) + 20;
    if (detectionType === 'Smoke' || detectionType === 'Fire') {
      aqi = Math.floor(Math.random() * 200) + 150;
    } else if (status === 'Offline') {
      aqi = 0;
    }

    return {
      sensorId: `SENS-TN-${String(index + 1).padStart(3, '0')}`,
      latitude: loc.lat + latOffset,
      longitude: loc.lng + lngOffset,
      location: loc.name,
      aqi,
      status,
      detectionType,
      cameraId: Math.random() > 0.5 ? `CAM-TN-${String(index + 1).padStart(3, '0')}` : 'None',
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000))
    };
  });
};

const seedSensors = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Sensor.deleteMany();
    console.log('Existing sensors cleared.');

    const mockSensors = generateMockSensors();
    await Sensor.insertMany(mockSensors);
    
    console.log(`Successfully seeded ${mockSensors.length} sensors.`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedSensors();
