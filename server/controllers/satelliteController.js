import SatelliteObservation from '../models/SatelliteObservation.js';
import { getPollutantData } from '../services/cdseService.js';
import { REGIONS, getRegionByName } from '../config/regions.js';

// ── Helper: save observation to MongoDB cache ──────────────────────────────
const upsertCache = async (regionName, pollutant, data, coords) => {
  return SatelliteObservation.findOneAndUpdate(
    {
      region:          regionName,
      pollutant,
      observationTime: new Date(data.observationTime),
    },
    {
      region:          regionName,
      district:        regionName,
      pollutant,
      averageValue:    data.meanValue,
      unit:            data.unit,
      aqiEstimate:     data.aqiEstimate ?? 0,
      observationTime: new Date(data.observationTime),
      resolution:      data.resolution,
      coverageArea:    'Tamil Nadu, India',
      satellite:       'Sentinel-5P',
      agency:          'ESA',
      source:          'Copernicus Atmosphere Monitoring Service',
      status:          'Active',
      quality:         data.quality,
      coordinates:     { lat: coords.lat, lng: coords.lng },
      fromCache:       false,
    },
    { upsert: true, returnDocument: 'after' }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/satellite/observations?region=&pollutant=&date=
// Primary endpoint: live Sentinel → MongoDB cache fallback
// ─────────────────────────────────────────────────────────────────────────────
export const getObservation = async (req, res) => {
  const { region: regionName, pollutant = 'NO2', date } = req.query;

  if (!regionName || !date) {
    return res.status(400).json({ success: false, message: 'region and date query parameters are required.' });
  }

  const region = getRegionByName(regionName);
  if (!region) {
    return res.status(400).json({ success: false, message: `Unknown region: ${regionName}` });
  }

  try {
    const originalTargetDate = new Date(date);
    
    // Loop up to 7 days backward
    for (let i = 0; i < 7; i++) {
      const loopDate = new Date(originalTargetDate);
      loopDate.setDate(originalTargetDate.getDate() - i);
      const loopDateStr = loopDate.toISOString().split('T')[0];

      // ── 1. Check MongoDB Cache FIRST for this exact day ──
      const cached = await SatelliteObservation.findOne({
        region: regionName,
        pollutant,
        observationTime: {
          $gte: new Date(loopDate.setUTCHours(0,0,0,0)),
          $lt: new Date(loopDate.setUTCHours(23,59,59,999))
        }
      });

      if (cached) {
        console.log(`[satellite] Cache HIT for ${regionName}/${pollutant}/${loopDateStr}`);
        return res.json({
          success: true,
          observation: { ...cached.toObject(), fromCache: true },
          requestedDate: date,
          actualObservationDate: loopDateStr,
          usedFallback: i > 0,
          searchedDays: i
        });
      }

      console.log(`[satellite] Cache MISS for ${regionName}/${pollutant}/${loopDateStr}. Calling CDSE...`);

      // ── 2. Call CDSE API ──
      const cdseData = await getPollutantData(regionName, region.bbox, pollutant, loopDateStr);

      if (cdseData) {
        const saved = await upsertCache(regionName, pollutant, cdseData, region);
        console.log(`[satellite] Success. Using fallback observation from: ${loopDateStr}`);
        return res.json({
          success: true,
          observation: { ...saved.toObject(), fromCache: false },
          requestedDate: date,
          actualObservationDate: loopDateStr,
          usedFallback: i > 0,
          searchedDays: i
        });
      }

      console.log(`[satellite] No observation found for ${loopDateStr}.`);
    }

    // ── 3. No data found after 7 days ──
    console.log(`[satellite] No data found for ${regionName} after 7 days of searching.`);
    return res.status(200).json({
      success: false,
      requestedDate: date,
      message: `No satellite observations available within the last 7 days.`
    });

  } catch (err) {
    console.error(`[satellite] Error in getObservation: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to fetch satellite data.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/satellite/map?pollutant=&date=
// Returns cached observations for ALL regions (for map markers).
// Does NOT call Sentinel API — reads MongoDB only for performance.
// ─────────────────────────────────────────────────────────────────────────────
export const getMapObservations = async (req, res) => {
  const { pollutant = 'NO2' } = req.query;

  try {
    // Get the latest cached observation per region for this pollutant
    const results = await SatelliteObservation.aggregate([
      { $match: { pollutant } },
      { $sort:  { observationTime: -1 } },
      {
        $group: {
          _id:  '$region',
          doc:  { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/satellite/history?region=&pollutant=&limit=30
// Historical cache — no Sentinel call. Ready for trend charts.
// ─────────────────────────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
  const { region, pollutant, limit = '30' } = req.query;

  try {
    const filter = {};
    if (region   && region   !== 'All') filter.region   = region;
    if (pollutant && pollutant !== 'All') filter.pollutant = pollutant;

    const history = await SatelliteObservation
      .find(filter)
      .sort({ observationTime: -1 })
      .limit(Math.min(Number(limit), 200));

    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/satellite/regions
// Returns all available regions — lets the frontend stay config-free.
// ─────────────────────────────────────────────────────────────────────────────
export const getRegions = async (_req, res) => {
  return res.json(REGIONS.map((r) => ({ name: r.name, lat: r.lat, lng: r.lng })));
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/satellite (manual ingestion / future real-time use)
// ─────────────────────────────────────────────────────────────────────────────
export const createObservation = async (req, res) => {
  try {
    const obs = new SatelliteObservation(req.body);
    const saved = await obs.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ message: 'Validation error', error: err.message });
  }
};
