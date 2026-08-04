import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Radio, Globe, AlertTriangle, Clock, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DetailsPanel = ({ selectedSensor, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-white border border-[#E2F0FF] rounded-[24px] shadow-sm flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8FBFF] to-white opacity-50 z-0 pointer-events-none" />
      
      <div className="p-6 border-b border-[#E2F0FF] flex justify-between items-center relative z-10 bg-white/50 backdrop-blur-md">
        <h3 className="text-lg font-bold text-[#0F172A]">Location Details</h3>
        {selectedSensor && (
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 p-6 relative z-10 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {!selectedSensor ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                <MapPin className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-[16px] font-bold text-slate-800">No location selected</h4>
              <p className="text-[13px] text-slate-500 mt-2 max-w-[200px]">Click on any map marker to view detailed sensor and environmental data.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-white
                  ${selectedSensor.status === 'Online' ? 'bg-gradient-to-br from-[#86EFAC] to-[#22C55E] text-white' : 
                    selectedSensor.status === 'Offline' ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : 
                    'bg-gradient-to-br from-orange-300 to-orange-400 text-white'}
                `}>
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#0F172A]">{selectedSensor.sensorId}</h2>
                  <p className="text-[13px] font-medium text-slate-500 mt-0.5">{selectedSensor.location}</p>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5
                  ${selectedSensor.status === 'Online' ? 'bg-green-50 text-green-600 border border-green-100' : 
                    selectedSensor.status === 'Offline' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 
                    'bg-orange-50 text-orange-600 border border-orange-100'}
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSensor.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                  {selectedSensor.status}
                </span>
                
                {selectedSensor.detectionType !== 'None' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    {selectedSensor.detectionType}
                  </span>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AQI Level</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[24px] font-bold text-[#0F172A] leading-none">{selectedSensor.aqi}</span>
                    <span className="text-[12px] font-medium text-slate-500">US</span>
                  </div>
                </div>
                <div className="bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Camera Node</p>
                  <div className="text-[14px] font-bold text-[#0F172A] leading-none mt-2 truncate">
                    {selectedSensor.cameraId !== 'None' ? selectedSensor.cameraId : 'Not Equipped'}
                  </div>
                </div>
              </div>

              {/* Coordinates List */}
              <div className="bg-white border border-[#E2F0FF] rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(59,130,246,0.1)]">
                <div className="px-4 py-2.5 bg-[#F8FBFF] border-b border-[#E2F0FF]">
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500" /> Geographical Data
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-slate-500">Latitude</span>
                    <span className="text-[13px] font-bold text-slate-800">{selectedSensor.latitude.toFixed(4)}° N</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-slate-500">Longitude</span>
                    <span className="text-[13px] font-bold text-slate-800">{selectedSensor.longitude.toFixed(4)}° E</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-slate-500">Last Synced</span>
                    <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(selectedSensor.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedSensor.detectionType !== 'None' && (
                <button 
                  onClick={() => navigate('/admin/evidence')}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl font-bold text-[14px] transition-colors"
                >
                  View Evidence Reports <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DetailsPanel;
