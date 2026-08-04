/**
 * Frontend region and pollutant constants.
 * Region names are kept in sync with server/config/regions.js.
 * Coordinates are NOT stored here — they come from the API response.
 */

export const REGION_NAMES = [
  "All", "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

export const POLLUTANTS = ['NO2', 'SO2', 'CO', 'Aerosol Index'];

export const POLLUTANT_LABELS = {
  NO2:             'Nitrogen Dioxide (NO₂)',
  SO2:             'Sulfur Dioxide (SO₂)',
  CO:              'Carbon Monoxide (CO)',
  'Aerosol Index': 'Aerosol Index (AI)',
};

export const POLLUTANT_UNITS = {
  NO2:             'mol/m²',
  SO2:             'DU',
  CO:              'mol/m²',
  'Aerosol Index': 'AI',
};
