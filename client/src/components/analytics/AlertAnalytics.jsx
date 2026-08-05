import React from 'react';
import { BellRing } from 'lucide-react';

const AlertAnalytics = ({ data }) => {
  const empty = !data || data.total === 0;

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
          <BellRing className="w-4 h-4 text-red-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">Alert Analytics</h3>
      </div>

      {empty ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF]">
          <span className="text-sm font-medium text-slate-400">No alerts generated yet</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Alerts</div>
              <div className="text-2xl font-black text-slate-700">{data.total}</div>
            </div>
            <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Active Now</div>
              <div className="text-2xl font-black text-red-700">{data.active}</div>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Alert Types</h4>
            <div className="space-y-3">
              {data.byType.map((type, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{type.name}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${(type.count / data.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-8 text-right">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertAnalytics;
