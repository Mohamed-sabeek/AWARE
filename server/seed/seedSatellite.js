import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SatelliteObservation from '../models/SatelliteObservation.js';

dotenv.config();

const now = new Date();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

const observations = [
  // NO2 observations across Tamil Nadu
  {
    region: 'Chennai',
    district: 'Chennai',
    pollutant: 'NO2',
    averageValue: 4.82,
    unit: 'µmol/m²',
    aqiEstimate: 148,
    observationTime: hoursAgo(2),
    resolution: '3.5 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 97,
    coordinates: { lat: 13.0827, lng: 80.2707 },
  },
  {
    region: 'Coimbatore',
    district: 'Coimbatore',
    pollutant: 'NO2',
    averageValue: 3.14,
    unit: 'µmol/m²',
    aqiEstimate: 98,
    observationTime: hoursAgo(3),
    resolution: '3.5 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 95,
    coordinates: { lat: 11.0168, lng: 76.9558 },
  },
  {
    region: 'Madurai',
    district: 'Madurai',
    pollutant: 'NO2',
    averageValue: 2.77,
    unit: 'µmol/m²',
    aqiEstimate: 84,
    observationTime: hoursAgo(4),
    resolution: '3.5 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 98,
    coordinates: { lat: 9.9252, lng: 78.1198 },
  },
  // SO2 observations
  {
    region: 'Tuticorin',
    district: 'Tuticorin',
    pollutant: 'SO2',
    averageValue: 6.21,
    unit: 'DU',
    aqiEstimate: 186,
    observationTime: hoursAgo(1),
    resolution: '3.5 km × 7.0 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 94,
    coordinates: { lat: 8.7642, lng: 78.1348 },
  },
  {
    region: 'Salem',
    district: 'Salem',
    pollutant: 'SO2',
    averageValue: 3.88,
    unit: 'DU',
    aqiEstimate: 117,
    observationTime: hoursAgo(5),
    resolution: '3.5 km × 7.0 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 96,
    coordinates: { lat: 11.6643, lng: 78.1460 },
  },
  // CO observations
  {
    region: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    pollutant: 'CO',
    averageValue: 0.042,
    unit: 'mol/m²',
    aqiEstimate: 72,
    observationTime: hoursAgo(2),
    resolution: '2.3 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 99,
    coordinates: { lat: 10.7905, lng: 78.7047 },
  },
  {
    region: 'Vellore',
    district: 'Vellore',
    pollutant: 'CO',
    averageValue: 0.031,
    unit: 'mol/m²',
    aqiEstimate: 54,
    observationTime: hoursAgo(6),
    resolution: '2.3 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 97,
    coordinates: { lat: 12.9165, lng: 79.1325 },
  },
  // Aerosol Index observations
  {
    region: 'Chennai',
    district: 'Chennai',
    pollutant: 'Aerosol Index',
    averageValue: 1.82,
    unit: 'AI',
    aqiEstimate: 138,
    observationTime: hoursAgo(3),
    resolution: '5.5 km × 3.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 93,
    coordinates: { lat: 13.0827, lng: 80.2707 },
  },
  {
    region: 'Thanjavur',
    district: 'Thanjavur',
    pollutant: 'Aerosol Index',
    averageValue: 1.14,
    unit: 'AI',
    aqiEstimate: 87,
    observationTime: hoursAgo(4),
    resolution: '5.5 km × 3.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 98,
    coordinates: { lat: 10.7870, lng: 79.1378 },
  },
  {
    region: 'Erode',
    district: 'Erode',
    pollutant: 'NO2',
    averageValue: 2.31,
    unit: 'µmol/m²',
    aqiEstimate: 70,
    observationTime: hoursAgo(7),
    resolution: '3.5 km × 5.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 99,
    coordinates: { lat: 11.3410, lng: 77.7172 },
  },
  {
    region: 'Tirunelveli',
    district: 'Tirunelveli',
    pollutant: 'SO2',
    averageValue: 2.04,
    unit: 'DU',
    aqiEstimate: 61,
    observationTime: hoursAgo(5),
    resolution: '3.5 km × 7.0 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 96,
    coordinates: { lat: 8.7139, lng: 77.7567 },
  },
  {
    region: 'Kancheepuram',
    district: 'Kancheepuram',
    pollutant: 'Aerosol Index',
    averageValue: 0.74,
    unit: 'AI',
    aqiEstimate: 45,
    observationTime: hoursAgo(8),
    resolution: '5.5 km × 3.5 km',
    coverageArea: 'Tamil Nadu, India',
    satellite: 'Sentinel-5P',
    agency: 'ESA',
    source: 'Copernicus Atmosphere Monitoring Service',
    status: 'Active',
    quality: 100,
    coordinates: { lat: 12.8342, lng: 79.7036 },
  },
];

const seedSatellite = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aware');
    console.log('MongoDB Connected');

    await SatelliteObservation.deleteMany();
    console.log('Cleared existing satellite observations');

    await SatelliteObservation.insertMany(observations);
    console.log(`Seeded ${observations.length} satellite observations successfully!`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedSatellite();
