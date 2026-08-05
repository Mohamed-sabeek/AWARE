import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Maximize2, RotateCcw, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const TAMIL_NADU_CENTER = [10.7, 78.5];
const DEFAULT_ZOOM = 7;

const POLLUTANT_COLORS = {
  NO2:             { low: '#22c55e', mid: '#f59e0b', high: '#ef4444', vhigh: '#7c3aed' },
  SO2:             { low: '#10b981', mid: '#f59e0b', high: '#f97316', vhigh: '#dc2626' },
  CO:              { low: '#3b82f6', mid: '#22c55e', high: '#f59e0b', vhigh: '#ef4444' },
  'Aerosol Index': { low: '#8b5cf6', mid: '#ec4899', high: '#ef4444', vhigh: '#7f1d1d' },
};

const AQI_BANDS = [
  { label: 'Good', range: '0–50',   color: '#22c55e' },
  { label: 'Moderate', range: '51–100', color: '#f59e0b' },
  { label: 'Poor', range: '101–150', color: '#f97316' },
  { label: 'Very Poor', range: '151–200', color: '#ef4444' },
  { label: 'Hazardous', range: '201+',   color: '#7c3aed' },
];

const getAqiColor = (aqi, pollutant) => {
  const c = POLLUTANT_COLORS[pollutant] || POLLUTANT_COLORS.NO2;
  if (aqi <= 50)  return c.low;
  if (aqi <= 100) return c.mid;
  if (aqi <= 150) return c.high;
  return c.vhigh;
};

const getAqiRadius = (aqi) => {
  if (aqi <= 50)  return 16;
  if (aqi <= 100) return 20;
  if (aqi <= 150) return 25;
  if (aqi <= 200) return 30;
  return 36;
};

// Sub-component: resets view on button click
const ResetViewControl = ({ onClick }) => null; // handled outside map

// Sub-component: Keeps map in sync when center changes
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.4 });
  }, [center, zoom]);
  return null;
};

const SatelliteMap = ({ observations, selectedObservation, onSelectObservation, activePollutant, opacity }) => {
  const [showLegend, setShowLegend] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const mapCenter = selectedObservation 
    ? [selectedObservation.coordinates.lat, selectedObservation.coordinates.lng] 
    : TAMIL_NADU_CENTER;
  const mapZoom = selectedObservation ? 9 : DEFAULT_ZOOM;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative z-0 flex-1 rounded-[24px] overflow-hidden border border-[#DCEEFF] shadow-sm bg-white"
      style={{ minHeight: 520 }}
    >
      {/* Map */}
      <MapContainer
        center={TAMIL_NADU_CENTER} // MapContainer center doesn't re-render dynamically, MapFlyTo does
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%', minHeight: 520 }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapFlyTo center={mapCenter} zoom={mapZoom} />

        <AnimatePresence>
          {observations.map((obs) => {
            const isSelected = selectedObservation?._id === obs._id;
            const color = getAqiColor(obs.aqiEstimate, obs.pollutant);
            const radius = getAqiRadius(obs.aqiEstimate);
            return (
              <CircleMarker
                key={obs._id}
                center={[obs.coordinates.lat, obs.coordinates.lng]}
                radius={isSelected ? radius + 5 : radius}
                pathOptions={{
                  color: '#fff',
                  weight: isSelected ? 3 : 1.5,
                  fillColor: color,
                  fillOpacity: opacity / 100,
                  opacity: 0.9,
                }}
                eventHandlers={{ click: () => onSelectObservation(obs) }}
              >
                <Popup>
                  <div className="font-sans text-sm">
                    <div className="font-bold text-slate-800">{obs.region}</div>
                    <div className="text-slate-500">{obs.pollutant}</div>
                    <div className="text-slate-700 font-semibold mt-1">AQI: {obs.aqiEstimate}</div>
                    <div className="text-slate-500 text-xs mt-1">{obs.averageValue} {obs.unit}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </AnimatePresence>
      </MapContainer>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        <button
          onClick={handleFullscreen}
          className="w-9 h-9 bg-white/90 backdrop-blur-sm border border-[#DCEEFF] rounded-xl flex items-center justify-center text-slate-600 hover:text-[#3B82F6] hover:border-[#93C5FD] shadow-sm transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLegend((v) => !v)}
          className={`w-9 h-9 bg-white/90 backdrop-blur-sm border rounded-xl flex items-center justify-center shadow-sm transition-all ${showLegend ? 'border-[#60A5FA] text-[#3B82F6]' : 'border-[#DCEEFF] text-slate-600 hover:text-[#3B82F6]'}`}
          title="Toggle Legend"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Active Layer Badge */}
      <div className="absolute top-4 left-4 z-[500]">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#DCEEFF] rounded-xl px-3 py-2 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
            {activePollutant === 'All' ? 'All Layers' : activePollutant}
          </span>
          <span className="text-[11px] text-slate-400">• Sentinel-5P</span>
        </div>
      </div>

      {/* Color Legend */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 z-[500] bg-white/90 backdrop-blur-sm border border-[#DCEEFF] rounded-2xl p-4 shadow-md min-w-[160px]"
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">AQI Scale</div>
            <div className="flex flex-col gap-2">
              {AQI_BANDS.map((band) => (
                <div key={band.label} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: band.color }} />
                  <span className="text-[12px] font-semibold text-slate-700">{band.label}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{band.range}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opacity Badge */}
      <div className="absolute bottom-4 right-4 z-[500] bg-white/90 backdrop-blur-sm border border-[#DCEEFF] rounded-xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[12px] font-semibold text-slate-600">{opacity}% opacity</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SatelliteMap;
