import dotenv from 'dotenv';
dotenv.config();

const testSentinel = async () => {
  const clientId = process.env.SENTINEL_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch('https://services.sentinel-hub.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log('Token obtained.');

  const requestBody = {
    input: {
      bounds: { bbox: [12, 41, 13, 42] },
      data: [{ type: 'sentinel-5p-l2' }]
    },
    aggregation: {
      timeRange: { from: '2023-01-01T00:00:00Z', to: '2023-01-02T00:00:00Z' },
      aggregationInterval: { of: 'P1D' },
      evalscript: `//VERSION=3
        function setup() {
          return {
            input: [{ bands: ["NO2", "dataMask"] }],
            output: [{ id: "default", bands: 1, sampleType: "FLOAT32" }]
          };
        }
        function evaluatePixel(sample) {
          if (sample.dataMask === 0) return [NaN];
          return [sample.NO2];
        }`
    },
    calculations: { default: { statistics: { default: { percentiles: { k: [50] } } } } }
  };

  const testEndpoint = async (url, type) => {
    requestBody.input.data[0].type = type;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    console.log(`\nTesting ${url} with type ${type}`);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text.substring(0, 150)}...`);
  };

  await testEndpoint('https://services.sentinel-hub.com/api/v1/statistics', 'sentinel-5p-l2');
  await testEndpoint('https://services.sentinel-hub.com/api/v1/statistics', 'S5P_L2');
  await testEndpoint('https://creodias.sentinel-hub.com/api/v1/statistics', 'sentinel-5p-l2');
  await testEndpoint('https://sh.dataspace.copernicus.eu/api/v1/statistics', 'sentinel-5p-l2');
  await testEndpoint('https://sh.dataspace.copernicus.eu/api/v1/statistics', 'S5P_L2');
  await testEndpoint('https://sh.dataspace.copernicus.eu/api/v1/statistics', 'SENTINEL5P_L2');
};

testSentinel();
