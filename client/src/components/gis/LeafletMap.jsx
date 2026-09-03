import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Radio, AlertTriangle, Wind, Camera } from 'lucide-react';
import AQILegend from './AQILegend';
import BottomStats from './BottomStats';

// Custom Marker Icon Generator
const createCustomIcon = (sensor) => {
  let bgColor = 'bg-slate-500';
  let shadowColor = 'shadow-slate-500/50';
  let IconComponent = Radio;

  if (sensor.status === 'Offline' || sensor.status === 'Maintenance') {
    bgColor = 'bg-slate-400';
    shadowColor = 'shadow-slate-400/50';
    IconComponent = Radio;
  } else if (sensor.detectionType === 'Smoke' || sensor.detectionType === 'Fire') {
    bgColor = 'bg-red-500';
    shadowColor = 'shadow-red-500/50';
    IconComponent = AlertTriangle;
  } else if (sensor.cameraId !== 'None') {
    bgColor = 'bg-blue-500';
    shadowColor = 'shadow-blue-500/50';
    IconComponent = Camera;
  } else if (sensor.aqi > 100) {
    bgColor = 'bg-orange-500';
    shadowColor = 'shadow-orange-500/50';
    IconComponent = Wind;
  } else {
    bgColor = 'bg-green-500';
    shadowColor = 'shadow-green-500/50';
    IconComponent = Radio;
  }

  // Use renderToStaticMarkup to convert Lucide react component to HTML string for Leaflet divIcon
  const iconHtml = renderToStaticMarkup(
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-lg ${bgColor} ${shadowColor} animate-in zoom-in duration-300`}>
      <IconComponent className="w-5 h-5 text-white" />
      {sensor.detectionType !== 'None' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
        </span>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Component to handle auto-panning when a marker is selected from outside the map
const MapAutoPan = ({ selectedSensor }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedSensor) {
      map.setView([selectedSensor.latitude, selectedSensor.longitude], 14, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedSensor, map]);
  return null;
};

const LeafletMap = ({ sensors, selectedSensor, onSelectSensor }) => {
  // Center of Tamil Nadu
  const defaultCenter = [11.1271, 78.6569];
  const defaultZoom = 7;

  return (
    <div className="flex-1 bg-slate-50 border border-[#E2F0FF] rounded-[24px] overflow-hidden relative shadow-sm min-h-[500px] flex flex-col z-10">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        className="w-full h-full flex-1 z-0"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapAutoPan selectedSensor={selectedSensor} />

        {sensors.map((sensor) => (
          <Marker 
            key={sensor.sensorId}
            position={[sensor.latitude, sensor.longitude]}
            icon={createCustomIcon(sensor)}
            eventHandlers={{
              click: () => onSelectSensor(sensor)
            }}
          >
            <Popup className="custom-popup rounded-2xl overflow-hidden shadow-xl border-0">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${sensor.status === 'Online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <h4 className="font-bold text-slate-800 m-0 leading-none">{sensor.sensorId}</h4>
                </div>
                <p className="text-xs text-slate-500 m-0 mb-3">{sensor.location}</p>
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AQI</span>
                  <span className={`font-bold ${sensor.aqi > 100 ? 'text-red-500' : 'text-slate-800'}`}>{sensor.aqi}</span>
                </div>
                
                {sensor.detectionType !== 'None' && (
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incident</span>
                    <span className="text-xs font-bold text-red-500">{sensor.detectionType}</span>
                  </div>
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSensor(sensor);
                  }}
                  className="w-full mt-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <AQILegend />
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-auto w-[90%] md:w-auto">
         <BottomStats sensors={sensors} />
      </div>

    </div>
  );
};

export default LeafletMap;
