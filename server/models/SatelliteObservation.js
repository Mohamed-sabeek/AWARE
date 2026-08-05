import mongoose from 'mongoose';

const satelliteObservationSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    pollutant: {
      type: String,
      required: true,
      enum: ['NO2', 'SO2', 'CO', 'Aerosol Index'],
    },
    averageValue: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
    },
    aqiEstimate: {
      type: Number,
    },
    observationTime: {
      type: Date,
      required: true,
    },
    resolution: {
      type: String,
    },
    coverageArea: {
      type: String,
    },
    satellite: {
      type: String,
      default: 'Sentinel-5P',
    },
    agency: {
      type: String,
      default: 'ESA',
    },
    source: {
      type: String,
      default: 'Copernicus Atmosphere Monitoring Service',
    },
    status: {
      type: String,
      enum: ['Active', 'Offline', 'Degraded'],
      default: 'Active',
    },
    quality: {
      type: Number,
      min: 0,
      max: 100,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    // Whether this observation was served from MongoDB cache (vs live Sentinel)
    fromCache: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient cache lookups
satelliteObservationSchema.index({ region: 1, pollutant: 1, observationTime: -1 });

const SatelliteObservation = mongoose.model('SatelliteObservation', satelliteObservationSchema);

export default SatelliteObservation;
