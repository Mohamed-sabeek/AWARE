import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Radio, Satellite } from 'lucide-react';

const AQI_BADGE = (aqi) => {
  if (!aqi) return { label: '—', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };
  if (aqi <= 50)  return { label: 'Good',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (aqi <= 100) return { label: 'Moderate',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' };
  if (aqi <= 150) return { label: 'Poor',      bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' };
  if (aqi <= 200) return { label: 'Very Poor', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' };
  return                  { label: 'Hazardous', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' };
};

const ComparisonCard = ({ observations }) => {
  const total = observations.length;
  
  // Real CDSE average
  const avgSatellite = total > 0
    ? Math.round(observations.reduce((s, o) => s + (o.averageValue ?? 0), 0) / total)
    : null;

  const satBadge = AQI_BADGE(avgSatellite);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.65 }}
      className="bg-white border border-[#E2F0FF] rounded-[24px] shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[18px] font-bold text-slate-800">Regional Comparison</h3>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Aggregate across {total} observation{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold bg-amber-50 text-amber-600 border-amber-200">
          <Activity className="w-3.5 h-3.5" /> Sensor Offline
        </div>
      </div>

      {/* Main Comparison Visual */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Ground Sensor */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-5 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center mx-auto mb-3">
            <Radio className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ground Sensor</div>
          <div className="text-[12px] font-bold text-slate-400 leading-tight">
            Waiting for<br />ESP32 Sensor
          </div>
        </div>

        {/* Difference / VS */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">VS</div>
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Minus className="w-5 h-5 text-slate-300" />
          </div>
          <div className="text-[18px] font-bold text-slate-300">—</div>
          <div className="text-[11px] text-slate-400 font-medium">Difference</div>
        </div>

        {/* Satellite */}
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#C4B5FD] rounded-2xl px-4 py-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Satellite className="w-5 h-5 text-white" />
          </div>
          <div className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-widest mb-2">Sentinel-5P</div>
          <div className="text-[32px] font-bold text-slate-800 leading-none mb-1 mt-1">
            {avgSatellite ?? '—'}
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${satBadge.bg} ${satBadge.text} ${satBadge.border}`}>
            {total > 0 ? (observations[0]?.unit || 'µmol/m²') : '—'}
          </span>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
        <div className="text-center">
          <div className="text-[12px] text-slate-400 font-medium mb-1">Confidence</div>
          <div className="text-[18px] font-bold text-slate-300">—</div>
        </div>
        <div className="text-center">
          <div className="text-[12px] text-slate-400 font-medium mb-1">Observations</div>
          <div className="text-[18px] font-bold text-slate-700">{total}</div>
        </div>
        <div className="text-center">
          <div className="text-[12px] text-slate-400 font-medium mb-1">Validation</div>
          <div className="text-[18px] font-bold text-slate-300">Pending</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonCard;
