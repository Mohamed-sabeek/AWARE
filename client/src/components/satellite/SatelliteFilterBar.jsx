import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { REGION_NAMES, POLLUTANTS } from '../../constants/regions';

const SelectFilter = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1 min-w-[160px]">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none h-[42px] pl-4 pr-9 bg-white border border-[#D6E8FF] rounded-xl text-[14px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/40 focus:border-[#60A5FA] cursor-pointer shadow-sm transition-all hover:border-[#93C5FD]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const SatelliteFilterBar = ({ region, setRegion, pollutant, setPollutant, date, setDate, onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className="bg-white border border-[#E2F0FF] rounded-2xl shadow-sm p-5 flex flex-wrap gap-5 items-end"
  >
    <SelectFilter
      label="Region"
      value={region}
      onChange={setRegion}
      options={REGION_NAMES}
    />
    <SelectFilter
      label="Pollutant Layer"
      value={pollutant}
      onChange={setPollutant}
      options={POLLUTANTS}
    />

    <div className="flex flex-col gap-1 min-w-[180px]">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Observation Date</label>
      <input
        type="date"
        value={date}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setDate(e.target.value)}
        className="h-[42px] px-4 bg-white border border-[#D6E8FF] rounded-xl text-[14px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/40 focus:border-[#60A5FA] shadow-sm transition-all hover:border-[#93C5FD]"
      />
    </div>

    <button
      onClick={onReset}
      className="ml-auto flex items-center gap-2 h-[42px] px-5 bg-[#F1F5F9] hover:bg-[#DBEAFE] text-slate-600 hover:text-[#3B82F6] border border-[#E2F0FF] hover:border-[#93C5FD] rounded-xl text-[13px] font-semibold transition-all duration-200 shadow-sm"
    >
      <RotateCcw className="w-4 h-4" />
      Reset Filters
    </button>
  </motion.div>
);

export default SatelliteFilterBar;
