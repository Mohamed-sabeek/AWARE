import React from 'react';

const AQILegend = () => {
  return (
    <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-md border border-[#E2F0FF] p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]">
      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">AQI Scale</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/40"></div>
          <span className="text-[13px] font-semibold text-slate-700">Good (0-50)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/40"></div>
          <span className="text-[13px] font-semibold text-slate-700">Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/40"></div>
          <span className="text-[13px] font-semibold text-slate-700">Poor (101-200)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/40"></div>
          <span className="text-[13px] font-semibold text-slate-700">Very Poor (201-300)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-600 shadow-sm shadow-purple-600/40"></div>
          <span className="text-[13px] font-semibold text-slate-700">Hazardous (301+)</span>
        </div>
      </div>
    </div>
  );
};

export default AQILegend;
