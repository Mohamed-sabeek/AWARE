import React from 'react';
import { Filter, X } from 'lucide-react';
import Select from '../ui/Select';

const EvidenceFilters = ({ filterStatus, setFilterStatus, onReset }) => {
  const statuses = ['All', 'NEW', 'ACKNOWLEDGED', 'UNDER INVESTIGATION', 'RESOLVED'];

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-xl border border-[#DCEEFF] rounded-[20px] p-4.5 shadow-[0_4px_20px_rgba(96,165,250,0.03)] flex flex-wrap items-center justify-between gap-4 relative z-20 font-sans">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-700 font-bold mr-2 border-r border-slate-200 pr-5 text-[14px]">
          <Filter className="w-4 h-4 text-blue-500" />
          Filter
        </div>
        
        <div className="flex items-center gap-3 relative z-30">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Incident Status</span>
          <Select 
            options={statuses}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-[220px]"
          />
        </div>
      </div>

      {filterStatus !== 'All' && (
        <button 
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-red-500 transition-colors ml-auto cursor-pointer"
        >
          <X className="w-4 h-4" /> Reset Filter
        </button>
      )}
    </div>
  );
};

export default EvidenceFilters;
