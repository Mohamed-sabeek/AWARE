import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Activity, Check, TrendingUp, TrendingDown } from 'lucide-react';

const useCounter = (end, duration = 1, decimals = 0) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(easeOut * end);
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return Number(count).toFixed(decimals);
};

const PremiumSummaryCard = ({ 
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
  delay,
  percentageOverride = null
}) => {
  const animatedValue = useCounter(value, 1.5, decimals);
  const controls = useAnimation();
  
  const percentage = percentageOverride !== null 
    ? percentageOverride 
    : (total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      whileHover={{ 
        y: -6, 
        boxShadow: `0 25px 50px -12px ${themeColor}15, 0 0 0 1px ${themeColor}20` 
      }}
      onHoverStart={() => controls.start("hover")}
      onHoverEnd={() => controls.start("initial")}
      className={`relative min-h-[190px] flex flex-col bg-gradient-to-br ${gradientBg} bg-white backdrop-blur-2xl border border-[#DCEEFF] rounded-[24px] p-6 shadow-sm overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full blur-[30px] group-hover:opacity-[0.08] transition-opacity duration-500`} style={{ backgroundColor: themeColor }} />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="relative">
          <div className={`absolute inset-0 rounded-[18px] opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500`} style={{ backgroundColor: themeColor }} />
          <div className="relative w-12 h-12 flex items-center justify-center rounded-[18px] bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent`} />
            <motion.div
              variants={{
                initial: { rotate: 0, scale: 1 },
                hover: { rotate: [-5, 5, 0], scale: 1.1 }
              }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-5 h-5 relative z-10" style={{ color: themeColor }} />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm">
          {statusText === 'Live Sync' ? (
            <Activity className="w-3 h-3 animate-pulse" style={{ color: themeColor }} />
          ) : (
            <Check className="w-3 h-3" style={{ color: themeColor }} />
          )}
          <span className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">{statusText}</span>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-[14px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] font-bold text-slate-800 leading-none tracking-tight">{animatedValue}</span>
          {(title === 'Online Sensors' || title === 'Cloud Uploads') && total > 0 && (
            <span className="text-lg font-bold text-slate-400">/ {total}</span>
          )}
          {title === 'System Health' && (
            <span className="text-2xl font-bold text-slate-800 ml-1">%</span>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {trendDir === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : trendDir === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <div className="w-3.5 h-3.5 bg-slate-300 rounded-full flex items-center justify-center text-[10px] text-white font-bold">-</div>
            )}
            <span className={`text-[13px] font-medium ${trendDir === 'up' ? 'text-emerald-600' : trendDir === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
              {trendDir === 'up' ? '+' : trendDir === 'down' ? '-' : ''}{trendVal}
            </span>
            <span className="text-[13px] font-medium text-slate-400">{trendPeriod}</span>
          </div>
          
          <span className="text-[12px] font-bold text-slate-400">{percentage}%</span>
        </div>

        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            className="h-full rounded-full relative"
            style={{ backgroundColor: themeColor }}
          >
            <motion.div 
              variants={{
                initial: { x: '-100%', opacity: 0 },
                hover: { x: '200%', opacity: 0.5 }
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumSummaryCard;
