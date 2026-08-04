import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, Globe, Clock, Zap, Database, CheckCircle2, AlertCircle } from 'lucide-react';

const MetaItem = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[#60A5FA]" />
    </div>
    <div className="flex-1">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      <div className={`text-[14px] font-semibold text-slate-700 mt-0.5 ${valueClass}`}>{value}</div>
    </div>
  </div>
);

const SatelliteDetails = ({ latestObservation }) => {
  const obs = latestObservation;
  const lastSync = obs
    ? new Date(obs.observationTime).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white border border-[#E2F0FF] rounded-[24px] shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[18px] font-bold text-slate-800">Satellite Details</h3>
          <p className="text-[13px] text-slate-400 mt-0.5">Platform and mission metadata</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[12px] font-bold text-emerald-700 uppercase tracking-wide">
            {obs?.status || 'Awaiting Data'}
          </span>
        </div>
      </div>

      {/* Satellite visual badge */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#EFF6FF] to-[#F5F3FF] rounded-2xl border border-[#DBEAFE] mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-md">
          <Satellite className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-[20px] font-bold text-slate-800">Sentinel-5P</div>
          <div className="text-[13px] text-slate-500 font-medium">TROPOMI · European Space Agency (ESA)</div>
          <div className="text-[12px] text-[#60A5FA] font-semibold mt-0.5">Sun-synchronous orbit · 824 km altitude</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <MetaItem icon={Globe} label="Agency" value={obs?.agency || '—'} />
        <MetaItem icon={Zap} label="Resolution" value={obs?.resolution || '—'} />
        <MetaItem icon={Clock} label="Last Sync" value={lastSync} />
        <MetaItem icon={Database} label="Data Source" value={obs?.source || '—'} />
        <MetaItem icon={Globe} label="Coverage Area" value={obs?.coverageArea || '—'} />
        <MetaItem
          icon={CheckCircle2}
          label="Data Quality"
          value={obs ? `${obs.quality}% Verified` : '—'}
          valueClass={obs && obs.quality >= 95 ? 'text-emerald-600' : 'text-amber-600'}
        />
      </div>
    </motion.div>
  );
};

export default SatelliteDetails;
