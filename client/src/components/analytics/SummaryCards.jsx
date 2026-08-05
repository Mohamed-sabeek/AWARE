import React from 'react';
import { Wind, AlertTriangle, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const SummaryCard = ({ title, value, subtitle, icon: Icon, trend, trendDir, colorClass, bgClass, empty }) => {
  return (
    <div className={`bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgClass} rounded-bl-full opacity-50 -z-10`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {!empty && trend !== null && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            trendDir === 'up' ? 'text-red-600 bg-red-50' : trendDir === 'down' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
          }`}>
            {trendDir === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trendDir === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <h3 className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-3xl font-black text-slate-800 tracking-tight">
          {empty || value === null ? '--' : value}
        </div>
        <p className="text-slate-400 text-sm font-medium mt-2">{subtitle}</p>
      </div>
    </div>
  );
};

const SummaryCards = ({ overview }) => {
  const empty = !overview || (overview.averageAqi === null && overview.alertsToday === 0 && overview.totalEvidence === 0);

  const getTrendDir = (val) => {
    if (!val || val === 0) return 'none';
    return val > 0 ? 'up' : 'down';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard 
        title="Average AQI" 
        value={overview?.averageAqi} 
        subtitle="Current 24h Average"
        icon={Wind}
        trend={overview?.aqiTrend}
        trendDir={getTrendDir(overview?.aqiTrend)}
        colorClass="text-blue-600"
        bgClass="from-blue-100 to-transparent"
        empty={empty || overview?.averageAqi === null}
      />
      <SummaryCard 
        title="Highest AQI" 
        value={overview?.highestAqi?.value} 
        subtitle={overview?.highestAqi?.date ? new Date(overview.highestAqi.date).toLocaleString('en-IN') : 'No records'}
        icon={Activity}
        trend={null}
        colorClass="text-orange-600"
        bgClass="from-orange-100 to-transparent"
        empty={empty || !overview?.highestAqi}
      />
      <SummaryCard 
        title="Alerts Generated" 
        value={overview?.alertsToday} 
        subtitle="Today's Active Alerts"
        icon={AlertTriangle}
        trend={null}
        colorClass="text-red-600"
        bgClass="from-red-100 to-transparent"
        empty={empty}
      />
      <SummaryCard 
        title="Evidence Captured" 
        value={overview?.totalEvidence} 
        subtitle="Total Lifetime Evidence"
        icon={ShieldCheck}
        trend={null}
        colorClass="text-purple-600"
        bgClass="from-purple-100 to-transparent"
        empty={empty}
      />
    </div>
  );
};

export default SummaryCards;
