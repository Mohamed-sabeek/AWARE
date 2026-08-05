import React from 'react';
import { Sun, Sunset, Moon, Sunrise, Clock } from 'lucide-react';

const PeakPollutionHours = ({ data }) => {
  const empty = !data;

  const periods = [
    { name: 'Morning', icon: Sunrise, time: '06:00 - 12:00', key: 'Morning' },
    { name: 'Afternoon', icon: Sun, time: '12:00 - 18:00', key: 'Afternoon' },
    { name: 'Evening', icon: Sunset, time: '18:00 - 22:00', key: 'Evening' },
    { name: 'Night', icon: Moon, time: '22:00 - 06:00', key: 'Night' }
  ];

  // Find max AQI period for highlighting
  const maxAqi = empty ? 0 : Math.max(data.Morning || 0, data.Afternoon || 0, data.Evening || 0, data.Night || 0);

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">Peak Pollution Hours</h3>
      </div>

      {empty ? (
        <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF]">
          <span className="text-sm font-medium text-slate-400">Waiting for historical data</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {periods.map((p, index) => {
            const aqi = data[p.key] || 0;
            const isHighest = aqi > 0 && aqi === maxAqi;
            
            return (
              <React.Fragment key={p.name}>
                <div className={`flex-1 w-full rounded-2xl p-4 border transition-all ${
                  isHighest ? 'bg-red-50 border-red-200 shadow-sm relative overflow-hidden' : 'bg-slate-50 border-slate-100 opacity-70'
                }`}>
                  {isHighest && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-bl-lg">
                      PEAK 🔥
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <p.icon className={`w-5 h-5 ${isHighest ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 mb-3">{p.time}</div>
                  
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">AQI</span>
                    <span className={`text-2xl font-black ${isHighest ? 'text-red-600' : 'text-slate-600'}`}>
                      {aqi}
                    </span>
                  </div>
                </div>
                
                {index < periods.length - 1 && (
                  <div className="hidden md:block text-slate-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeakPollutionHours;
