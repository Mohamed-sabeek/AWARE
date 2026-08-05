import React from 'react';
import { ShieldAlert, CheckCircle, Clock, XCircle } from 'lucide-react';

const EvidenceAnalytics = ({ data }) => {
  const empty = !data || data.total === 0;

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">Evidence Analytics</h3>
      </div>

      {empty ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF]">
          <span className="text-sm font-medium text-slate-400">No evidence available</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Evidence</div>
              <div className="text-2xl font-black text-slate-800">{data.total}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Verified</div>
              </div>
              <div className="text-2xl font-black text-emerald-700">{data.verified}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending</div>
              </div>
              <div className="text-2xl font-black text-amber-700">{data.pending}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-1.5 mb-1">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Rejected</div>
              </div>
              <div className="text-2xl font-black text-red-700">{data.rejected}</div>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-3">
              {data.categories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(cat.count / data.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-8 text-right">{cat.count}</span>
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

export default EvidenceAnalytics;
