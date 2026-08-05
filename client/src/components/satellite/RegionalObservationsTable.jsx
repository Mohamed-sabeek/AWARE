import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Activity, AlertCircle } from 'lucide-react';

const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

const AQI_BADGE = (aqi) => {
  if (aqi <= 50)  return { label: 'Good',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (aqi <= 100) return { label: 'Moderate',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' };
  if (aqi <= 150) return { label: 'Poor',      bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' };
  if (aqi <= 200) return { label: 'Very Poor', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' };
  return                  { label: 'Hazardous', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' };
};

const RegionalObservationsTable = ({ observations }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('district'); // 'district' or 'aqi'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const tableData = useMemo(() => {
    return DISTRICTS.map(district => {
      const obs = observations.find(o => o.region === district);
      if (obs) {
        return {
          district,
          hasData: true,
          aqi: obs.aqiEstimate,
          pollutant: obs.pollutant,
          avgValue: `${obs.averageValue} ${obs.unit}`,
          date: new Date(obs.observationTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date(obs.observationTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          satellite: obs.satellite || 'Sentinel-5P',
          quality: obs.quality
        };
      }
      return {
        district,
        hasData: false,
        aqi: null,
        pollutant: '—',
        avgValue: '—',
        date: '—',
        time: '—',
        satellite: '—',
        quality: null
      };
    });
  }, [observations]);

  const filteredAndSortedData = useMemo(() => {
    let result = tableData.filter(item => 
      item.district.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortField === 'district') {
        return sortOrder === 'asc' ? a.district.localeCompare(b.district) : b.district.localeCompare(a.district);
      }
      if (sortField === 'aqi') {
        const aqiA = a.hasData ? a.aqi : -1;
        const aqiB = b.hasData ? b.aqi : -1;
        return sortOrder === 'asc' ? aqiA - aqiB : aqiB - aqiA;
      }
      return 0;
    });

    return result;
  }, [tableData, search, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity"><ChevronUp /></div>;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] shadow-sm overflow-hidden flex flex-col mt-6">
      {/* Header & Search */}
      <div className="px-6 py-5 border-b border-[#E2F0FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-800">Regional Pollution Observations</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">Live satellite monitoring across districts</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E2F0FF]">
              <th 
                className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('district')}
              >
                <div className="flex items-center gap-1.5">
                  District Name
                  <SortIcon field="district" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('aqi')}
              >
                <div className="flex items-center gap-1.5">
                  AQI
                  <SortIcon field="aqi" />
                </div>
              </th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Pollutant</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Avg Value</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Satellite</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Data Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2F0FF]">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-[14px]">
                  No districts found matching "{search}"
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row) => {
                const badge = row.hasData ? AQI_BADGE(row.aqi) : null;
                
                return (
                  <tr key={row.district} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-bold text-slate-700">{row.district}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.hasData ? (
                        <span className="text-[16px] font-bold text-slate-800">{row.aqi}</span>
                      ) : (
                        <span className="text-[13px] text-slate-400 font-medium">No Data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-slate-600">
                      {row.pollutant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.hasData ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-50 text-slate-500 border-slate-200">
                          Unavailable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-slate-600">
                      {row.avgValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.hasData ? (
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-slate-700">{row.date}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">{row.time}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-medium text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-slate-600">
                      {row.satellite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.hasData ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${row.quality >= 90 ? 'bg-emerald-500' : row.quality >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${row.quality}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-bold text-slate-600">{row.quality}%</span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-medium text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionalObservationsTable;
