import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = {
  Good: '#10b981',      // Emerald
  Moderate: '#f59e0b',  // Amber
  Poor: '#f97316',      // Orange
  'Very Poor': '#ef4444', // Red
  Hazardous: '#a855f7'  // Purple
};

const AQIDistribution = ({ data }) => {
  const empty = !data || data.length === 0 || data.every(d => d.value === 0);

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <PieChartIcon className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">AQI Distribution</h3>
      </div>
      
      <div className="flex-1 relative w-full h-full">
        {empty ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF] mt-4">
            <span className="text-sm font-medium text-slate-400">No AQI observations yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {!empty && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
              <span className="text-xs font-semibold text-slate-600">{entry.name} ({entry.percentage}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AQIDistribution;
