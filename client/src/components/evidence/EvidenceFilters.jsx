import React from 'react';
import { Filter, X } from 'lucide-react';
import Select from '../ui/Select';

const EvidenceFilters = ({ filterType, setFilterType, filterStatus, setFilterStatus, onReset }) => {
  const types = ['All', 'Smoke', 'Fire', 'Deforestation', 'Illegal Mining', 'Other'];
  const statuses = ['All', 'Pending', 'Verified', 'Rejected', 'Report Generated'];

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-xl border border-[#DCEEFF] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(96,165,250,0.03)] flex flex-wrap items-center gap-4 relative z-20">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mr-2 border-r border-slate-200 pr-6">
        <Filter className="w-4 h-4 text-blue-500" />
        Filters
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex items-center gap-3 relative z-30">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Type</span>
          <Select 
            options={types}
            value={filterType}
            onChange={setFilterType}
            className="w-[160px]"
          />
        </div>

        <div className="flex items-center gap-3 relative z-20">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
          <Select 
            options={statuses}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-[160px]"
          />
        </div>
      </div>

      {(filterType !== 'All' || filterStatus !== 'All') && (
        <button 
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors ml-auto"
        >
          <X className="w-4 h-4" /> Reset Filters
        </button>
      )}
    </div>
  );
};

export default EvidenceFilters;
