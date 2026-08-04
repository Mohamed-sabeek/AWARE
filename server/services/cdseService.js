import dotenv from 'dotenv';
dotenv.config();

const CDSE_TOKEN_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const CDSE_STATS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/statistics';

let accessToken = null;
let tokenExpiry = null;

// Helper to convert internal pollutant name to CDSE band name
const getBandForPollutant = (pollutant) => {
  const mapping = {
    NO2: 'NO2',
    CO: 'CO',
    SO2: 'SO2',
    O3: 'O3',
    AER_AI: 'AER_AI_340_380'
  };
  return mapping[pollutant] || 'NO2';
};

export const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return accessToken; // Return cached token if valid (with 1 minute buffer)
  }

  const clientId = process.env.CDSE_CLIENT_ID;
  const clientSecret = process.env.CDSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('CDSE_CLIENT_ID or CDSE_CLIENT_SECRET missing in .env');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  console.log('[cdseService] Requesting new CDSE access token...');
  const res = await fetch(CDSE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[cdseService] Auth Error:', errText);
    throw new Error(`Unable to authenticate with CDSE: ${res.status}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  console.log(`[cdseService] Token generated successfully (expires in ${data.expires_in}s).`);
  return accessToken;
};

export const getPollutantData = async (regionName, bbox, pollutant, dateStr) => {
  // Input Validation
  if (!bbox || bbox.length !== 4) {
    throw new Error('Invalid bbox for CDSE request. Expected [minLng, minLat, maxLng, maxLat].');
  }

  // CDSE requires a Polygon geometry in bounds.geometry
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const polygon = [
    [minLng, minLat],
    [maxLng, minLat],
    [maxLng, maxLat],
    [minLng, maxLat],
    [minLng, minLat] // close the polygon
  ];

  // Define Time Range. Buffer by -1 day to ensure we catch the overpass if time zone differs
  const targetDate = new Date(dateStr);
  const fromDate = new Date(targetDate);
  fromDate.setDate(fromDate.getDate() - 1);
  
  const fromStr = fromDate.toISOString();
  const toStr = new Date(targetDate.getTime() + 86400000).toISOString(); // +1 day

  const band = getBandForPollutant(pollutant);

  const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["${band}", "dataMask"] }],
    output: [
      { id: "default", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(sample) {
  // If dataMask is 0, or band value is missing, or band value is NaN (invalid pixel)
  if (sample.dataMask === 0 || sample.${band} === undefined || isNaN(sample.${band})) {
    return {
      default: [NaN],
      dataMask: [0]
    };
  }
  return {
    default: [sample.${band}],
    dataMask: [1]
  };
}`;

  const requestBody = {
    input: {
      bounds: {
        geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      },
      data: [{ type: 'sentinel-5p-l2' }]
    },
    aggregation: {
      timeRange: { from: fromStr, to: toStr },
      aggregationInterval: { of: 'P1D' },
      evalscript: evalscript,
      resx: 1000,
      resy: 1000
    },
    calculations: {
      default: {
        statistics: {
          default: {
            percentiles: { k: [50] }
          }
        }
      }
    }
  };

  const MAX_RETRIES = 2;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const token = await getAccessToken();
      console.log(`[cdseService] Requesting stats for ${regionName} (${pollutant}) on ${dateStr} - Attempt ${attempt + 1}`);

      const res = await fetch(CDSE_STATS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errData = await res.text();
        if (res.status === 401) {
          console.warn('[cdseService] Token expired or invalid, forcing refresh...');
          accessToken = null; // Force refresh
          attempt++;
          continue;
        }
        throw new Error(`CDSE API Error (${res.status}): ${errData}`);
      }

      const data = await res.json();
      
      // Response Normalization
      if (!data.data || data.data.length === 0) {
        console.log(`[cdseService] No satellite observations found for ${regionName}.`);
        return null;
      }

      // We requested 1 day interval, just take the first valid one
      let validStat = null;
      for (const entry of data.data) {
        const stats = entry.outputs.default.bands.B0.stats;
        // ONLY accept if mean is a valid number (not NaN, not undefined, not null)
        if (stats.sampleCount > 0 && typeof stats.mean === 'number' && !Number.isNaN(stats.mean)) {
          validStat = stats;
          break;
        }
      }

      if (!validStat) {
        console.log(`[cdseService] Observation exists but all pixels masked (or NaN) for ${regionName}.`);
        return null;
      }

      // Convert from mol/m2 to µmol/m2 for readability
      const multiplier = 1000000;
      
      console.log(`[cdseService] Success for ${regionName}.`);
      return {
        region: regionName,
        pollutant: pollutant,
        date: dateStr,
        meanValue: parseFloat((validStat.mean * multiplier).toFixed(2)),
        max: parseFloat((validStat.max * multiplier).toFixed(2)),
        min: parseFloat((validStat.min * multiplier).toFixed(2)),
        unit: 'µmol/m²',
        quality: 98,
        resolution: '10x10 km',
        source: 'Copernicus Data Space',
        aqiEstimate: parseFloat((validStat.mean * multiplier * 1.5).toFixed(0)), // mock AQI
        observationTime: new Date(dateStr).toISOString()
      };

    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`[cdseService] Failed after ${MAX_RETRIES} retries:`, error.message);
        throw error;
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
    }
  }
};
