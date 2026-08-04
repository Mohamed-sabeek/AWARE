import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  Globe, Radio, AlertTriangle, Activity,
  Camera, MapPin, Clock, ShieldAlert, Cpu, 
  Database, Server, RefreshCw, BellRing, Power,
  CheckCircle2, AlertCircle, FileCheck, UserCheck, Shield
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';

// CountUp Component
const CountUp = ({ value, decimals = 0, duration = 2, delay = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(count, value, { duration, delay, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
};

// Premium Glass Card Wrapper
const GlassCard = ({ children, className = "", delay = 0, glowColor = "rgba(96, 165, 250, 0.15)", noHoverGlow = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -6, boxShadow: `0 25px 40px -10px ${glowColor}, 0 10px 20px -8px rgba(96, 165, 250, 0.1)` }}
    className={`bg-white/90 backdrop-blur-xl rounded-[24px] border border-[#DCEEFF] p-8 shadow-[0_8px_30px_rgba(96,165,250,0.04)] transition-all overflow-hidden relative group flex flex-col ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-0" />
    {!noHoverGlow && (
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-[#F8FBFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
    )}
    <div className="relative z-10 flex-1 flex flex-col">{children}</div>
  </motion.div>
);

// Sparkline SVG Component
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12 overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#grad-${color.replace('#', '')})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
};

const LiveMonitoring = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fps, setFps] = useState(29.97);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const fpsTimer = setInterval(() => setFps((29.8 + Math.random() * 0.3).toFixed(2)), 1500);
    return () => { clearInterval(timer); clearInterval(fpsTimer); };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader 
        title="Live Monitoring"
        description="Monitor live sensors, camera feeds, and AI detections."
      />
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans">


      {/* SECTION 1: System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Live AQI */}
        <PremiumSummaryCard 
          title="Average AQI" 
          value={0} 
          total={500} 
          trendVal="0"
          trendDir="none"
          trendPeriod="today"
          statusText="Live Sync"
          icon={Globe} 
          themeColor="#22c55e" 
          gradientBg="from-green-50/40 to-transparent"
          delay={0.1}
        />

        {/* Active Sensors */}
        <PremiumSummaryCard 
          title="Active Sensors" 
          value={0} 
          total={0} 
          trendVal="0"
          trendDir="none"
          trendPeriod="today"
          statusText="Online"
          icon={Radio} 
          themeColor="#0ea5e9" 
          gradientBg="from-sky-50/40 to-transparent"
          delay={0.2}
        />

        {/* Active Alerts */}
        <PremiumSummaryCard 
          title="Active Alerts" 
          value={0} 
          total={0} 
          trendVal="0"
          trendDir="none"
          trendPeriod="today"
          statusText="Action Required"
          icon={AlertTriangle} 
          themeColor="#ef4444" 
          gradientBg="from-red-50/40 to-transparent"
          delay={0.3}
        />

        {/* System Status */}
        <PremiumSummaryCard 
          title="System Health" 
          value={0}
          total={100} 
          trendVal="0"
          trendDir="none"
          trendPeriod="today"
          statusText="Uptime"
          icon={Activity} 
          themeColor="#3b82f6" 
          gradientBg="from-blue-50/40 to-transparent"
          delay={0.4}
          percentageOverride={0}
        />

      </div>

      {/* SECTION 2 & 3: Camera Feed and Current Incident */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Camera Feed - The visual centerpiece */}
        {/* Camera Feed - The visual centerpiece */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="xl:col-span-2 relative rounded-[32px] overflow-hidden bg-[#0A111F] min-h-[580px] shadow-[0_20px_50px_rgba(15,23,42,0.3)] border border-[#1E293B]"
        >
          {/* Subtle Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />
          
          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 bg-gradient-to-b from-[#0A111F]/90 via-[#0A111F]/40 to-transparent">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.02, 1] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-red-400 text-[13px] font-bold tracking-widest uppercase">Live Stream</span>
              </motion.div>
              <div className="px-4 py-2 bg-[#0F172A]/60 backdrop-blur-xl border border-white/5 rounded-full flex items-center gap-2 text-white/90 text-[13px] font-medium tracking-wide uppercase">
                <Clock className="w-4 h-4 text-[#7DD3FC]" />
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#0F172A]/60 backdrop-blur-xl border border-white/5 rounded-full text-[12px] font-mono text-white/70">
                <span>FPS: <span className="text-white font-bold">{fps}</span></span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>RES: <span className="text-white font-bold">4K UHD</span></span>
              </div>
            </div>
          </div>

          {/* Central Content Area (Perfectly Centered) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-8">
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#7DD3FC 1px, transparent 1px), linear-gradient(90deg, #7DD3FC 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* AI Bounding Box & Target Label */}
            <div className="relative flex flex-col items-center mb-8 z-10">
              {/* AI Target Label */}
              <div className="absolute -top-10 bg-[#0EA5E9]/10 backdrop-blur-md text-[#7DD3FC] border border-[#38BDF8]/40 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.15)] whitespace-nowrap">
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#38BDF8]/10 rounded-full blur-md"
                />
                <ShieldAlert className="w-3.5 h-3.5 text-[#38BDF8] z-10" />
                <span className="z-10">SMOKE SIGNATURE DETECTED</span>
              </div>

              {/* Bounding Box */}
              <div className="w-[320px] h-[220px] border border-[#7DD3FC]/30 bg-[#7DD3FC]/[0.02] rounded-lg flex items-center justify-center backdrop-blur-sm relative overflow-hidden group">
                {/* Box Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#38BDF8] rounded-tl-sm opacity-70" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#38BDF8] rounded-tr-sm opacity-70" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#38BDF8] rounded-bl-sm opacity-70" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#38BDF8] rounded-br-sm opacity-70" />
                
                {/* Centered Camera Icon Inside Box */}
                <motion.div 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex items-center justify-center"
                >
                  <Camera className="w-16 h-16 text-[#7DD3FC]/40" strokeWidth={1} />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#7DD3FC] rounded-full blur-2xl -z-10"
                  />
                </motion.div>
                
                {/* Internal Smooth Scan Line */}
                <motion.div 
                  animate={{ y: [0, 220, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7DD3FC] to-transparent opacity-30 shadow-[0_0_10px_#7DD3FC]" 
                />
              </div>
            </div>

            {/* Centered Waiting Message */}
            <div className="flex flex-col items-center text-center px-6 z-10">
              <p className="text-[#38BDF8] font-mono text-[13px] tracking-[0.2em] uppercase font-semibold mb-3 bg-[#0EA5E9]/10 px-3 py-1 rounded-full border border-[#0EA5E9]/20 inline-block">
                Signal Acquired
              </p>
              <h3 className="text-white/95 text-[28px] font-semibold tracking-wide shadow-sm">
                Waiting for ESP32-CAM Video Stream...
              </h3>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 w-full bg-[#0A111F]/80 backdrop-blur-xl border-t border-white/5 p-5 flex flex-wrap gap-6 items-center justify-center z-20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-white/90 font-mono text-[13px] font-medium tracking-wider">CAM-NRT-04</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-white/70 text-[13px] font-medium tracking-wide">
              <MapPin className="w-4 h-4 inline mr-1 text-[#7DD3FC]"/> Industrial Zone B
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/70 text-[13px] font-mono font-medium tracking-wide">
               <Cpu className="w-4 h-4 text-[#7DD3FC] animate-pulse" />
               AWARE-Net v2.4 (Active)
            </div>
            <div className="flex-1" />
            <motion.div 
              animate={{ opacity: [0.7, 1, 0.7] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 rounded-full text-[#10B981] text-[11px] font-bold tracking-widest border border-[#10B981]/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              UPLINK STABLE
            </motion.div>
          </div>
        </motion.div>

        {/* Current Incident - Redesigned for hierarchy */}
        <GlassCard delay={0.6} className="xl:col-span-1 border-l-[6px] border-l-orange-500 p-8 h-full flex flex-col relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 text-orange-500/5 rotate-12">
            <ShieldAlert className="w-64 h-64" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Active Incident</h2>
            <div className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[12px] font-bold tracking-widest uppercase border border-slate-200 shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              Clear
            </div>
          </div>
          
          <div className="space-y-7 relative z-10 flex-1">
            
            <div>
              <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-2">Detection Signature</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-[#0F172A] font-bold text-[18px]">None</h3>
                  <p className="text-[#64748B] text-[14px] font-medium mt-0.5">Waiting for detection</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-[#F8FBFF] p-5 rounded-2xl border border-[#DCEEFF]">
              <div>
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-1">Local AQI</p>
                <p className="text-[#0F172A] font-bold text-[28px] tracking-tight">0 <span className="text-[14px] font-medium text-slate-400">Good</span></p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-1">AI Confidence</p>
                <p className="text-[#3B82F6] font-bold text-[28px] tracking-tight">0<span className="text-[16px]">%</span></p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-[#0F172A] font-medium text-[15px]">-</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-0.5">Time Logged</p>
                  <p className="text-[#0F172A] font-medium text-[15px]">-</p>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#DCEEFF] relative z-10">
             <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                 <FileCheck className="w-4 h-4 text-green-500" /> Evidence Captured
               </div>
               <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                 <BellRing className="w-4 h-4 text-green-500" /> Alerts Dispatched
               </div>
               <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A] col-span-2">
                 <UserCheck className="w-4 h-4 text-[#3B82F6]" /> Assigned: Dept of Environment
               </div>
             </div>
          </div>
        </GlassCard>

      </div>


      
      {/* SECTION 7 & 8: Connected Devices */}
      <div className="mt-8">
        
        {/* Connected Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              name: "ESP32 Sensor Array", type: "Microcontroller", icon: Cpu, ping: "0ms", status: "Waiting", health: 0, uptime: "0%", sync: "-",
              glow: "rgba(100, 116, 139, 0.2)",
              colors: {
                bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                iconBg: "from-slate-50 to-slate-100/50"
              }
            },
            { 
              name: "ESP32-CAM Node", type: "Vision System", icon: Camera, ping: "0ms", status: "Waiting", health: 0, uptime: "0%", sync: "-",
              glow: "rgba(100, 116, 139, 0.2)",
              colors: {
                bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                iconBg: "from-slate-50 to-slate-100/50"
              }
            },
            { 
              name: "AWARE Core API", type: "Node.js Backend", icon: Server, ping: "0ms", status: "Waiting", health: 0, uptime: "0%", sync: "-",
              glow: "rgba(100, 116, 139, 0.2)",
              colors: {
                bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                iconBg: "from-slate-50 to-slate-100/50"
              }
            },
            { 
              name: "MongoDB Atlas", type: "Cloud Database", icon: Database, ping: "0ms", status: "Waiting", health: 0, uptime: "0%", sync: "-",
              glow: "rgba(100, 116, 139, 0.2)",
              colors: {
                bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                iconBg: "from-slate-50 to-slate-100/50"
              }
            },
          ].map((device, i) => (
            <GlassCard key={i} delay={1.0 + (i * 0.05)} glowColor={device.glow} className="p-6">
              <div className="flex flex-col h-full relative z-10">
                {/* Header: Icon & Badges */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${device.colors.iconBg} border ${device.colors.border} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <device.icon className={`w-6 h-6 ${device.colors.text}`} />
                  </div>
                  <div className={`px-2.5 py-1 rounded-full ${device.colors.bg} border ${device.colors.border} ${device.colors.text} flex items-center gap-1.5 shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.colors.indicator} animate-pulse`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{device.status}</span>
                  </div>
                </div>

                {/* Identity */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#0F172A] text-[16px] truncate">{device.name}</h4>
                  <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{device.type}</p>
                </div>

                {/* Health Score */}
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Health Score</span>
                    <span className={`text-[14px] font-bold ${device.colors.text}`}>{device.health}%</span>
                  </div>
                  <div className={`w-full h-1.5 ${device.colors.progressBg} rounded-full overflow-hidden`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${device.health}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 + (i * 0.1) }}
                      className={`h-full ${device.colors.progress} rounded-full relative`}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-5 border-t border-[#F1F5F9]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Latency</p>
                    <p className="text-[#0F172A] font-semibold text-[13px]">{device.ping}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Last Sync</p>
                    <p className="text-[#0F172A] font-semibold text-[13px]">{device.sync}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Uptime</p>
                    <p className="text-[#0F172A] font-semibold text-[13px]">{device.uptime}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(600px); }
        }
        .animate-scan {
          animation: scan 3.5s linear infinite;
        }
      `}</style>
      
      {/* SVG Helper */}
      <svg className="hidden">
        <symbol id="scanline" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect width="100" height="100" fill="url(#scanline-grad)" />
          <linearGradient id="scanline-grad" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="transparent" />
             <stop offset="50%" stopColor="rgba(59,130,246,0.2)" />
             <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </symbol>
      </svg>
    </div>
    </div>
  );
};

const ScanLine = () => (
  <svg className="absolute w-full h-full" preserveAspectRatio="none">
    <use href="#scanline" className="w-full h-full animate-scan" />
  </svg>
)

export default LiveMonitoring;
