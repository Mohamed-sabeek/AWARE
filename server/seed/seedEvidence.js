import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Evidence from '../models/Evidence.js';

dotenv.config();

const dummyEvidences = [
  {
    evidenceId: 'EV-2024-001',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9cce?q=80&w=800&auto=format&fit=crop', // Forest fire/smoke
    cloudinaryPublicId: 'mock_public_id_1',
    detectionType: 'Smoke',
    aqi: 184,
    confidence: 98.5,
    location: 'Sector 4, Industrial Zone B',
    latitude: 34.0522,
    longitude: -118.2437,
    sensorId: 'SN-8821',
    cameraId: 'CAM-01',
    status: 'Pending',
    reportStatus: 'Not Generated',
    emailStatus: 'Not Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
  },
  {
    evidenceId: 'EV-2024-002',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: 'mock_public_id_2',
    detectionType: 'Deforestation',
    aqi: 45,
    confidence: 92.1,
    location: 'Amazon Reserve Area 7',
    latitude: -3.4653,
    longitude: -62.2159,
    sensorId: 'SN-4029',
    cameraId: 'CAM-08',
    status: 'Verified',
    reportStatus: 'Generated',
    emailStatus: 'Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    evidenceId: 'EV-2024-003',
    imageUrl: 'https://images.unsplash.com/photo-1469122312224-c5846569feb1?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: 'mock_public_id_3',
    detectionType: 'Fire',
    aqi: 310,
    confidence: 99.8,
    location: 'Yosemite Valley North',
    latitude: 37.8651,
    longitude: -119.5383,
    sensorId: 'SN-9912',
    cameraId: 'CAM-03',
    status: 'Report Generated',
    reportStatus: 'Generated',
    emailStatus: 'Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    evidenceId: 'EV-2024-004',
    imageUrl: 'https://images.unsplash.com/photo-1520113412547-0e698889980d?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: 'mock_public_id_4',
    detectionType: 'Illegal Mining',
    aqi: 110,
    confidence: 88.4,
    location: 'Copper Basin',
    latitude: -12.0464,
    longitude: -77.0428,
    sensorId: 'SN-2210',
    cameraId: 'CAM-12',
    status: 'Pending',
    reportStatus: 'Not Generated',
    emailStatus: 'Not Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
  },
  {
    evidenceId: 'EV-2024-005',
    imageUrl: 'https://images.unsplash.com/photo-1590494497678-a006dbde4d64?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: 'mock_public_id_5',
    detectionType: 'Smoke',
    aqi: 220,
    confidence: 95.2,
    location: 'New Delhi Industrial Area',
    latitude: 28.6139,
    longitude: 77.2090,
    sensorId: 'SN-5531',
    cameraId: 'CAM-05',
    status: 'Verified',
    reportStatus: 'Not Generated',
    emailStatus: 'Not Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
  },
  {
    evidenceId: 'EV-2024-006',
    imageUrl: 'https://images.unsplash.com/photo-1496309732348-3627f3f040ee?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: 'mock_public_id_6',
    detectionType: 'Fire',
    aqi: 195,
    confidence: 91.0,
    location: 'Australian Outback Region 2',
    latitude: -25.2744,
    longitude: 133.7751,
    sensorId: 'SN-1102',
    cameraId: 'CAM-09',
    status: 'Rejected',
    reportStatus: 'Not Generated',
    emailStatus: 'Not Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72) // 3 days ago
  }
];

// Add more procedural data
for(let i = 7; i <= 15; i++) {
  const types = ['Smoke', 'Fire', 'Deforestation', 'Illegal Mining', 'Other'];
  const statuses = ['Pending', 'Verified', 'Rejected', 'Report Generated'];
  
  dummyEvidences.push({
    evidenceId: `EV-2024-00${i > 9 ? i : '0' + i}`,
    imageUrl: 'https://images.unsplash.com/photo-1628186256976-133b3b64c784?q=80&w=800&auto=format&fit=crop',
    cloudinaryPublicId: `mock_public_id_${i}`,
    detectionType: types[Math.floor(Math.random() * types.length)],
    aqi: Math.floor(Math.random() * 300) + 20,
    confidence: (Math.random() * 20 + 80).toFixed(1), // 80 to 100
    location: `Zone ${Math.floor(Math.random() * 20) + 1} Perimeter`,
    latitude: (Math.random() * 180 - 90).toFixed(4),
    longitude: (Math.random() * 360 - 180).toFixed(4),
    sensorId: `SN-${Math.floor(Math.random() * 9000) + 1000}`,
    cameraId: `CAM-${Math.floor(Math.random() * 20) + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    reportStatus: 'Not Generated',
    emailStatus: 'Not Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 10))
  });
}

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Evidence.deleteMany();
    console.log('Evidences wiped');

    await Evidence.insertMany(dummyEvidences);
    console.log('Dummy evidences injected successfully!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
