import fs from 'fs';

const districts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchRegions() {
  const regions = [];
  
  for (const district of districts) {
    console.log(`Fetching ${district}...`);
    try {
      const query = encodeURIComponent(`${district}, Tamil Nadu, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: { 'User-Agent': 'AWARE-App/1.0 (sabeek1730@gmail.com)' }
      });
      
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        // boundingbox is ["southlat", "northlat", "westlon", "eastlon"] in Nominatim
        // We need [westLng, southLat, eastLng, northLat]
        const bb = item.boundingbox;
        const bbox = [
          parseFloat(bb[2]), // westLng
          parseFloat(bb[0]), // southLat
          parseFloat(bb[3]), // eastLng
          parseFloat(bb[1])  // northLat
        ];
        
        regions.push({
          name: district,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          bbox: bbox
        });
      } else {
        console.warn(`No data for ${district}`);
      }
    } catch (e) {
      console.error(`Error for ${district}:`, e.message);
    }
    // Respect Nominatim limits
    await sleep(1000);
  }
  
  const fileContent = `/**
 * Tamil Nadu regions with coordinates and bounding boxes for Sentinel Hub API.
 * bbox format: [west, south, east, north] in EPSG:4326
 */
export const REGIONS = ${JSON.stringify(regions, null, 2)};

export const getRegionByName = (name) => REGIONS.find((r) => r.name === name) || null;
`;

  fs.writeFileSync('config/regions.js', fileContent);
  console.log('Successfully wrote config/regions.js');
}

fetchRegions();
