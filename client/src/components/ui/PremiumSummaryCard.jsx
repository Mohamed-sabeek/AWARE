import React from 'react';
import { Activity, Check, TrendingUp, TrendingDown } from 'lucide-react';

const PremiumSummaryCard = React.memo(({ 
  title, 
  value, 
  total,
  decimals = 0,
  trendVal, 
  trendDir,
  trendPeriod,
  statusText, 
  icon: Icon, 
  themeColor,
  gradientBg,
  percentageOverride = null
}) => {
  const displayValue = typeof value === 'number' 
    ? (decimals > 0 ? value.toFixed(decimals) : value.toString())
    : value;

  const percentage = percentageOverride !== null 
    ? percentageOverride 
    : (total > 0 && typeof value === 'number' ? Math.min(Math.round((value / total) * 100), 100) : 0);
  
  return (
    <div
      className={`relative min-h-[180px] flex flex-col bg-gradient-to-br ${gradientBg} bg-white border border-[#DCEEFF] rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden group`}
    >
      {/* Subtle static ambient glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full pointer-events-none" 
        style={{ backgroundColor: themeColor }} 
      />

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="relative">
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-white border border-slate-100 shadow-sm transition-transform duration-200 group-hover:scale-105"
          >
            <Icon className="w-5 h-5" style={{ color: themeColor }} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-100 shadow-sm">
          {statusText === 'Live Sync' || statusText === 'Live Stream' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: themeColor }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: themeColor }}></span>
            </span>
          ) : (
            <Check className="w-3 h-3" style={{ color: themeColor }} />
          )}
          <span className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">{statusText}</span>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[38px] md:text-[42px] font-bold text-slate-800 leading-none tracking-tight font-mono">{displayValue}</span>
          {(title === 'Online Sensors' || title === 'Cloud Uploads') && total > 0 && (
            <span className="text-base font-bold text-slate-400">/ {total}</span>
          )}
          {title === 'System Health' && (
            <span className="text-xl font-bold text-slate-800 ml-1">%</span>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {trendDir === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : trendDir === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <div className="w-3 h-3 bg-slate-300 rounded-full flex items-center justify-center text-[9px] text-white font-bold">-</div>
            )}
            <span className={`text-[12px] font-medium ${trendDir === 'up' ? 'text-emerald-600' : trendDir === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
              {trendDir === 'up' ? '+' : trendDir === 'down' ? '-' : ''}{trendVal}
            </span>
            {trendPeriod && <span className="text-[12px] font-medium text-slate-400">{trendPeriod}</span>}
          </div>
          
          <span className="text-[11px] font-bold text-slate-400">{percentage}%</span>
        </div>

        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: themeColor }}
          />
        </div>
      </div>
    </div>
  );
});

PremiumSummaryCard.displayName = 'PremiumSummaryCard';

export default PremiumSummaryCard;
