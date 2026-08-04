import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import Select from '../ui/Select';

const FilterBar = ({ 
  search, setSearch, 
  status, setStatus, 
  type, setType, 
  aqi, setAqi,
  onReset 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[#DCEEFF] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(96,165,250,0.03)] flex flex-wrap items-center gap-4 relative z-40 mb-6">
      
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search location or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />
      </div>

      <div className="w-px h-8 bg-slate-200 hidden md:block mx-1" />

      <div className="flex items-center gap-3 relative z-30">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block">Status</span>
        <Select 
          options={['All', 'Online', 'Offline', 'Maintenance']}
          value={status}
          onChange={setStatus}
          className="w-[140px]"
        />
      </div>

      <div className="flex items-center gap-3 relative z-20">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block">Incident</span>
        <Select 
          options={['All', 'None', 'Smoke', 'Fire', 'Deforestation', 'Illegal Mining']}
          value={type}
          onChange={setType}
          className="w-[150px]"
        />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block">AQI Level</span>
        <Select 
          options={['All', 'Good (0-50)', 'Moderate (51-100)', 'Poor (101-200)', 'Hazardous (201+)']}
          value={aqi}
          onChange={setAqi}
          className="w-[170px]"
        />
      </div>

      {(search || status !== 'All' || type !== 'All' || aqi !== 'All') && (
        <button 
          onClick={onReset}
          className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 hover:bg-blue-100 hover:border-blue-200 transition-colors ml-auto shadow-sm"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}

    </div>
  );
};

export default FilterBar;
