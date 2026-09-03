import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  MapPin, 
  Save, 
  Trash2,
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Cpu, 
  Navigation, 
  Crosshair, 
  Compass, 
  Radio,
  LocateFixed,
  X,
  Layers,
  Info
} from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

// Custom Pin Icon for Leaflet
const createPinIcon = (label) => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center group -translate-x-1/2 -translate-y-full pointer-events-auto">
      {/* Tooltip badge above pin */}
      <div className="bg-[#0F172A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl border border-blue-400/40 whitespace-nowrap mb-1 flex items-center gap-1.5 animate-bounce">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{label || 'Selected Location'}</span>
      </div>
      
      {/* Pin Body */}
      <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] rounded-full border-3 border-white shadow-[0_6px_20px_rgba(37,99,235,0.4)] text-white">
        <MapPin className="w-4.5 h-4.5 drop-shadow-sm" strokeWidth={2.5} />
        <span className="absolute -bottom-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping opacity-75" />
      </div>

      {/* Pin Needle pointer */}
      <div className="w-2 h-2.5 bg-[#2563EB] rotate-45 -mt-1 rounded-sm border-r border-b border-white" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-pin-marker',
    iconSize: [40, 54],
    iconAnchor: [20, 54],
    popupAnchor: [0, -54]
  });
};

// Component to handle map clicks and move marker
const LocationClickManager = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
    }
  });
  return null;
};

// Component to pan map smoothly when coordinates change programmatically
const MapPanner = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
};

// Component to capture and hold map instance
const MapInstanceHolder = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
};

// Component to guarantee Leaflet recalculates dimensions when container resizes
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver;
    const container = map.getContainer();
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [map]);
  return null;
};

const SensorLocation = () => {
  // Sensors state
  const [sensors, setSensors] = useState([]);
  const [selectedSensorId, setSelectedSensorId] = useState('ESP32-CAM-001');
  const [customDeviceId, setCustomDeviceId] = useState('');
  const [isCustomDevice, setIsCustomDevice] = useState(false);

  // Form fields
  const [locationName, setLocationName] = useState('Industrial Area - Streetlight 01');
  const [latitude, setLatitude] = useState(11.016800);
  const [longitude, setLongitude] = useState(76.955800);

  // Map state
  const mapInstanceRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([11.016800, 76.955800]);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapTileStyle, setMapTileStyle] = useState('osm');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Center map smoothly on currently selected sensor node coordinates
  const handleLocateNode = () => {
    if (latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude)) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([latitude, longitude], 16, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
      setMapCenter([latitude, longitude]);
      setMapZoom(16);
    }
  };

  // Fetch sensors on mount
  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sensors');
      if (data && Array.isArray(data) && data.length > 0) {
        setSensors(data);
        
        // Match selected sensor or default to first
        const active = data.find(s => s.sensorId === selectedSensorId) || data[0];
        if (active) {
          applySensorToState(active);
        }
      } else {
        setSensors([]);
        setSelectedSensorId('');
        setLocationName('');
        setLatitude(null);
        setLongitude(null);
      }
    } catch (err) {
      console.error('Error loading sensors:', err);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const applySensorToState = (sensor) => {
    setSelectedSensorId(sensor.sensorId);
    setLocationName(sensor.locationName || sensor.location || 'ESP32 Station');
    const lat = sensor.latitude !== undefined && sensor.latitude !== null && sensor.latitude !== 0 ? sensor.latitude : 11.016800;
    const lng = sensor.longitude !== undefined && sensor.longitude !== null && sensor.longitude !== 0 ? sensor.longitude : 76.955800;
    setLatitude(parseFloat(lat.toFixed(6)));
    setLongitude(parseFloat(lng.toFixed(6)));
    setMapCenter([lat, lng]);
    setMapZoom(15);
  };

  // Handle sensor switch from dropdown
  const handleSensorChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsCustomDevice(true);
      setSelectedSensorId('NEW-NODE');
      setCustomDeviceId('');
      setLocationName('');
      setLatitude(11.016800);
      setLongitude(76.955800);
      setMapCenter([11.016800, 76.955800]);
    } else {
      setIsCustomDevice(false);
      const found = sensors.find(s => s.sensorId === val);
      if (found) {
        applySensorToState(found);
      }
    }
    setFeedback({ type: '', message: '' });
  };

  // Handle click on the map
  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
    setFeedback({ type: '', message: '' });
  };

  // Preset location quick selection
  const handleQuickCenter = (presetLat, presetLng, presetName) => {
    setLatitude(presetLat);
    setLongitude(presetLng);
    setMapCenter([presetLat, presetLng]);
    setMapZoom(16);
    if (presetName && (!locationName || locationName === 'ESP32 Station')) {
      setLocationName(presetName);
    }
  };

  // Save location to backend
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const targetDeviceId = isCustomDevice ? customDeviceId.trim() : selectedSensorId;

    // Client-side validations
    if (!targetDeviceId) {
      setFeedback({ type: 'error', message: 'Please select or enter a valid Device ID.' });
      return;
    }

    if (!locationName || !locationName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a descriptive Location Name for this installation.' });
      return;
    }

    if (latitude === null || isNaN(latitude) || latitude < -90 || latitude > 90) {
      setFeedback({ type: 'error', message: 'Latitude must be a valid number between -90 and 90.' });
      return;
    }

    if (longitude === null || isNaN(longitude) || longitude < -180 || longitude > 180) {
      setFeedback({ type: 'error', message: 'Longitude must be a valid number between -180 and 180.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        deviceId: targetDeviceId,
        sensorId: targetDeviceId,
        locationName: locationName.trim(),
        location: locationName.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      const { data } = await api.put('/sensors/location', payload);

      if (data && data.success) {
        setFeedback({ 
          type: 'success', 
          message: `✓ Fixed location for ${targetDeviceId} saved successfully!` 
        });

        // Update local sensors list with new data
        setSensors(prev => {
          const idx = prev.findIndex(s => s.sensorId === targetDeviceId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...payload };
            return updated;
          } else {
            return [...prev, payload];
          }
        });

        if (isCustomDevice) {
          setIsCustomDevice(false);
          setSelectedSensorId(targetDeviceId);
        }
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Failed to update location' });
      }
    } catch (err) {
      console.error('Error saving sensor location:', err);
      const errMessage = err.response?.data?.message || err.message || 'Server error while saving location.';
      setFeedback({ type: 'error', message: errMessage });
    } finally {
      setSaving(false);
    }
  };

  // Delete sensor node registration
  const handleDeleteSensor = async () => {
    const active = sensors.find(s => s.sensorId === selectedSensorId);
    const targetIdentifier = active?._id || selectedSensorId;

    if (!targetIdentifier) return;

    setDeleting(true);
    setFeedback({ type: '', message: '' });

    try {
      const { data } = await api.delete(`/sensors/${targetIdentifier}`);

      if (data && data.success) {
        setIsDeleteModalOpen(false);
        setFeedback({ 
          type: 'success', 
          message: `✓ Sensor node '${selectedSensorId}' deleted successfully.` 
        });

        // Update local list
        const remaining = sensors.filter(s => s.sensorId !== selectedSensorId && s._id !== targetIdentifier);
        setSensors(remaining);

        if (remaining.length > 0) {
          applySensorToState(remaining[0]);
        } else {
          // Empty state
          setSelectedSensorId('');
          setLocationName('');
          setLatitude(null);
          setLongitude(null);
          setIsCustomDevice(false);
        }
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Failed to delete sensor node.' });
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting sensor node:', err);
      const errMessage = err.response?.data?.message || err.message || 'Server error while deleting sensor node.';
      setFeedback({ type: 'error', message: errMessage });
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const activeSensor = sensors.find(s => s.sensorId === selectedSensorId);

  // Map Tile URLs (Standard OpenStreetMap with zero watermark)
  const tileLayers = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Page Header - Full-width sticky top bar */}
      <PageHeader 
        title="Sensor Location Management" 
        description="Assign, calibrate, and update fixed installation coordinates for AWARE physical IoT nodes."
      />

      {/* Main Page Content Body - Fits exact screen height */}
      <div className="flex-1 p-3.5 lg:p-4.5 xl:p-5 w-full max-w-[1680px] mx-auto font-sans min-h-0 flex flex-col box-border overflow-hidden">
        
        {/* Main Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-stretch w-full min-w-0 flex-1 min-h-0">
        
          {/* Left Column / Controls Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-3 min-w-0 h-full overflow-y-auto custom-scrollbar pr-0.5"
          >
            {/* Main Configuration Card */}
            <div className="bg-white/95 backdrop-blur-xl border border-[#DCEEFF] rounded-[22px] p-4.5 xl:p-5 shadow-[0_6px_25px_rgba(96,165,250,0.05)] flex flex-col gap-3.5">
              
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E2F0FF]">
                <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-sm shrink-0">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15.5px] font-extrabold text-[#0F172A] tracking-tight truncate">Installation Point</h3>
                  <p className="text-[11.5px] text-[#64748B] font-medium truncate">Link sensor ID to permanent coordinates</p>
                </div>
              </div>

              {/* Empty State when no nodes exist and not in Add mode */}
              {sensors.length === 0 && !isCustomDevice ? (
                <div className="py-6 px-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-sm">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-[14px]">No Sensor Nodes Registered</h4>
                    <p className="text-slate-500 text-[11.5px] mt-0.5 max-w-[220px] leading-relaxed">
                      All physical node registrations have been removed or none exist yet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDevice(true);
                      setSelectedSensorId('NEW-NODE');
                      setCustomDeviceId('ESP32-CAM-001');
                      setLocationName('Industrial Area - Streetlight 01');
                      setLatitude(11.016800);
                      setLongitude(76.955800);
                      setMapCenter([11.016800, 76.955800]);
                    }}
                    className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    + Register Node
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveLocation} className="flex flex-col gap-3">
                  
                  {/* 1. Device Selection */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12.5px] font-bold text-[#0F172A] flex items-center justify-between">
                      <span>Target Sensor Device</span>
                      <span className="text-[10.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {sensors.length} Nodes
                      </span>
                    </label>
                    
                    <div className="relative">
                      <select
                        value={isCustomDevice ? '__new__' : selectedSensorId}
                        onChange={handleSensorChange}
                        className="w-full px-3.5 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:ring-3 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all shadow-sm cursor-pointer truncate"
                      >
                        {sensors.map((s) => (
                          <option key={s.sensorId} value={s.sensorId}>
                            {s.sensorId} — {s.locationName || s.location || 'Unassigned Location'}
                          </option>
                        ))}
                        <option value="__new__">+ Add / Calibrate New Node ID...</option>
                      </select>
                    </div>

                    {isCustomDevice && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1.5">
                        <input
                          type="text"
                          placeholder="e.g. ESP32-CAM-002"
                          value={customDeviceId}
                          onChange={(e) => setCustomDeviceId(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-[12.5px] font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* 2. Location Name Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12.5px] font-bold text-[#0F172A]">
                      Installation Site Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Industrial Area - Streetlight 01"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:ring-3 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all shadow-sm placeholder:text-gray-400 placeholder:font-normal"
                      />
                      <MapPin className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 3. Coordinates (Lat / Lng) Inputs */}
                  <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        min="-90"
                        max="90"
                        value={latitude !== null && latitude !== undefined ? latitude : ''}
                        placeholder="e.g. 11.016800"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setLatitude(isNaN(val) ? null : val);
                          if (!isNaN(val)) setMapCenter([val, longitude || 76.955800]);
                        }}
                        className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[12.5px] font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        min="-180"
                        max="180"
                        value={longitude !== null && longitude !== undefined ? longitude : ''}
                        placeholder="e.g. 76.955800"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setLongitude(isNaN(val) ? null : val);
                          if (!isNaN(val)) setMapCenter([latitude || 11.016800, val]);
                        }}
                        className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[12.5px] font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Map Tip */}
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-[11.5px] text-blue-800 leading-snug">
                    <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tip:</strong> Click anywhere on the map or drag the pin to set installation coordinates.
                    </span>
                  </div>

                  {/* Feedback Alert */}
                  <AnimatePresence>
                    {feedback.message && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-[12px] font-semibold ${
                          feedback.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {feedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="truncate">{feedback.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons: Save and Delete */}
                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={saving || deleting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Location...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Fixed Location</span>
                        </>
                      )}
                    </button>

                    {/* Delete Node Action Button */}
                    {!isCustomDevice && activeSensor && (
                      <button
                        type="button"
                        disabled={saving || deleting}
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/80 text-red-600 font-bold text-[12.5px] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Node</span>
                      </button>
                    )}
                  </div>

                </form>
              )}

            </div>

            {/* Telemetry / Status Card */}
            {activeSensor && (
              <div className="bg-white/95 border border-[#DCEEFF] rounded-[20px] p-3.5 shadow-sm flex flex-col gap-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#64748B] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-500" /> Active Node ID
                  </span>
                  <span className="font-mono font-bold text-[#0F172A] bg-gray-100 px-2 py-0.5 rounded-md">
                    {activeSensor.sensorId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#64748B]">Node Status</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeSensor.status || 'Online'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#64748B]">Current Voltage</span>
                  <span className="font-mono font-bold text-blue-600">
                    {activeSensor.voltage ? `${Number(activeSensor.voltage).toFixed(3)} V` : '0.285 V (Normal)'}
                  </span>
                </div>
              </div>
            )}

          </motion.div>

          {/* Right Column / Map Container */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-[400px] lg:min-h-0 min-w-0"
          >
            {/* Rounded Map Wrapper Card */}
            <div 
              className="flex-1 w-full bg-white/95 border border-[#DCEEFF] rounded-[22px] shadow-[0_6px_25px_rgba(96,165,250,0.05)] flex flex-col overflow-hidden relative min-h-0"
              style={{ isolation: 'isolate' }}
            >
              
              {/* Map Header Toolbar */}
              <div className="px-4 py-2.5 bg-white/95 border-b border-[#E2F0FF] flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10">
                
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100 text-[#2563EB] font-mono text-[11.5px] font-bold shrink-0">
                    <Navigation className="w-3 h-3 animate-pulse shrink-0" />
                    <span>
                      {latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude)
                        ? `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`
                        : 'No Point Selected'}
                    </span>
                  </div>
                  <span className="text-[11.5px] font-bold text-[#64748B] hidden sm:inline truncate">
                    Interactive Calibrator
                  </span>
                </div>

                {/* Quick Actions & Preset Centers */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Locate Node Button */}
                  <button
                    type="button"
                    onClick={handleLocateNode}
                    disabled={latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Center map on selected node location"
                  >
                    <LocateFixed className="w-3 h-3" />
                    <span>Locate Node</span>
                  </button>

                  <div className="w-px h-4 bg-[#DCEEFF] hidden sm:block" />

                  {/* City Preset Centers */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCenter(11.0168, 76.9558, 'Coimbatore City')}
                      className="px-2 py-0.5 text-[10.5px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Coimbatore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCenter(13.0827, 80.2707, 'Chennai Hub')}
                      className="px-2 py-0.5 text-[10.5px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Chennai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCenter(12.9716, 77.5946, 'Bengaluru Zone')}
                      className="px-2 py-0.5 text-[10.5px] font-bold rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      Bengaluru
                    </button>
                  </div>
                </div>

              </div>

              {/* Actual Leaflet Map Canvas Area */}
              <div className="flex-1 w-full h-full relative min-h-0 overflow-hidden">
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  className="w-full h-full z-0"
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    url={tileLayers[mapTileStyle].url}
                    attribution={tileLayers[mapTileStyle].attribution}
                  />

                  {/* Map instance ref holder */}
                  <MapInstanceHolder onMapReady={(m) => { mapInstanceRef.current = m; }} />

                  {/* Resize observer to keep map dimensions pixel-perfect */}
                  <MapResizeHandler />

                  {/* Smooth FlyTo controller */}
                  <MapPanner center={mapCenter} zoom={mapZoom} />

                  {/* Click event listener */}
                  <LocationClickManager onLocationSelect={handleMapClick} />

                  {/* Selected Location Pin Marker (Only rendered when valid coordinates exist) */}
                  {latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude) && (
                    <Marker 
                      position={[latitude, longitude]}
                      icon={createPinIcon(locationName || selectedSensorId)}
                      draggable={true}
                      eventHandlers={{
                        dragend(e) {
                          const marker = e.target;
                          const position = marker.getLatLng();
                          handleMapClick(parseFloat(position.lat.toFixed(6)), parseFloat(position.lng.toFixed(6)));
                        }
                      }}
                    />
                  )}

                </MapContainer>

                {/* Floating Bottom Coordinates Badge */}
                {latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude) && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-[#0F172A]/90 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5 text-[11px] font-mono pointer-events-none max-w-[90%] truncate">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">NODE:</span>
                      <span className="font-bold text-blue-400">{selectedSensorId || 'UNCONFIGURED'}</span>
                    </div>
                    <div className="w-px h-2.5 bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">LAT:</span>
                      <span className="font-bold text-emerald-400">{latitude.toFixed(6)}</span>
                    </div>
                    <div className="w-px h-2.5 bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">LNG:</span>
                      <span className="font-bold text-emerald-400">{longitude.toFixed(6)}</span>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      <AnimatePresence>
        {isDeleteModalOpen && activeSensor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-red-100 z-10 flex flex-col gap-3.5 font-sans"
            >
              {/* Header with Danger Icon */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#0F172A] tracking-tight">
                    Delete Sensor Node?
                  </h3>
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    You are about to permanently remove:
                  </p>
                </div>
              </div>

              {/* Node Summary Card */}
              <div className="bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl p-3 flex flex-col gap-1.5 text-[12.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Device ID:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {activeSensor.sensorId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                    {activeSensor.locationName || activeSensor.location || 'Unassigned Location'}
                  </span>
                </div>
              </div>

              {/* Active Device Warning */}
              {activeSensor.status === 'Online' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11.5px] leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{activeSensor.sensorId}</strong> is currently online. Deleting this node will remove its registration from AWARE. The physical device will not be erased or disabled.
                  </span>
                </div>
              )}

              <p className="text-[12px] text-slate-500 leading-relaxed">
                This action cannot be undone. Historical environmental evidence, voltage logs, and incident records will remain preserved for auditing.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-[13px] hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteSensor}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Node</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SensorLocation;
