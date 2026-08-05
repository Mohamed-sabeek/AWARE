import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Satellite, Shield } from 'lucide-react';

const AQI_BADGE = (aqi) => {
  if (aqi <= 50)  return { label: 'Good',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (aqi <= 100) return { label: 'Moderate',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' };
  if (aqi <= 150) return { label: 'Poor',      bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' };
  if (aqi <= 200) return { label: 'Very Poor', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' };
  return                  { label: 'Hazardous', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' };
};

const DetailRow = ({ label, value, valueClass = '' }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <span className="text-[13px] text-slate-400 font-medium">{label}</span>
    <span className={`text-[13px] font-semibold text-slate-700 ${valueClass}`}>{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-56 text-center px-6">
    <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-4">
      <Satellite className="w-7 h-7 text-[#60A5FA]" />
    </div>
    <h3 className="text-slate-700 font-bold text-base mb-1">No Region Selected</h3>
    <p className="text-slate-400 text-sm leading-relaxed">
      Click any marker on the map to view detailed satellite observation data.
    </p>
  </div>
);

const InfoPanel = ({ selectedObservation, region, isFetchingLive }) => {
  const obs = selectedObservation;
  const isUnavailable = !obs && region && region !== 'All';
  const showStats = obs || isUnavailable;

  const badge = obs ? AQI_BADGE(obs.aqiEstimate) : { label: 'Unavailable', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };

  const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--';
  const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="lg:w-[360px] shrink-0 flex flex-col gap-4 relative"
    >
      {isFetchingLive && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[24px]">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <span className="text-sm font-bold text-slate-600">Fetching live data...</span>
        </div>
      )}

      {/* Observation Details */}
      <div className="bg-white border border-[#E2F0FF] rounded-[24px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-slate-800">Location Details</h3>
            {showStats && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            )}
          </div>
          {showStats && (
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span className="text-[13px] font-semibold text-slate-600">{obs ? obs.region : region}, Tamil Nadu</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <AnimatePresence mode="wait">
            {showStats ? (
              <motion.div
                key={obs ? obs._id : 'unavailable'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {/* Big AQI Value */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[52px] font-bold text-slate-800 leading-none">{obs ? obs.aqiEstimate : '--'}</span>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">AQI</span>
                    <span className="text-[12px] font-semibold text-slate-500">{obs ? obs.pollutant : 'Layer'}</span>
                  </div>
                </div>

                <div className="space-y-0">
                  <DetailRow label="Avg Value" value={obs ? `${obs.averageValue} ${obs.unit}` : '--'} />
                  <DetailRow label="Observation Date" value={formatDate(obs?.observationTime)} />
                  <DetailRow label="Observation Time" value={formatTime(obs?.observationTime)} />
                  <DetailRow label="Satellite" value={obs ? obs.satellite : 'Sentinel-5P'} />
                  <DetailRow label="Agency" value={obs ? obs.agency : 'ESA'} />
                  <DetailRow label="Resolution" value={obs ? obs.resolution : '--'} />
                  <DetailRow label="Coverage" value={obs ? obs.coverageArea : '--'} />
                  <DetailRow
                    label="Data Quality"
                    value={obs ? `${obs.quality}%` : 'Unavailable'}
                    valueClass={obs ? (obs.quality >= 95 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-500'}
                  />
                </div>
              </motion.div>
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>
      </div>

    </motion.div>
  );
};

export default InfoPanel;
