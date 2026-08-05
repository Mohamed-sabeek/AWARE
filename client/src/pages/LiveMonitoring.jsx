import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  Globe, Radio, AlertTriangle, Activity,
  Camera, MapPin, Clock, ShieldAlert, Cpu, 
  Database, Server, RefreshCw, BellRing, Power,
  CheckCircle2, AlertCircle, FileCheck, UserCheck, Shield, WifiOff
} from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';

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

const LiveMonitoringSkeleton = () => (
  <div className="w-full space-y-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 bg-white/40 rounded-[24px] border border-[#E2F0FF]"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 h-[580px] bg-slate-800/40 rounded-[32px]"></div>
      <div className="xl:col-span-1 h-[580px] bg-white/40 rounded-[24px] border border-[#E2F0FF]"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-white/40 rounded-[24px] border border-[#E2F0FF]"></div>
      ))}
    </div>
  </div>
);

const LiveMonitoring = () => {
  const [stats, setStats] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = async () => {
    try {
      const [dashRes, sensRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/sensors')
      ]);
      setStats(dashRes.data);
      setSensors(sensRes.data);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch live monitoring data', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(timeInterval); };
  }, []);

  const latestAlert = stats?.latestAlert;
  
  // Find a camera sensor if it exists
  const cameraNode = sensors.find(s => s.cameraId && s.cameraId !== 'None') || null;

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader 
        title="Live Monitoring"
        description="Monitor live sensors, camera feeds, and AI detections."
      />
      
      {error && (
        <div className="mx-8 mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3 text-sm font-semibold shadow-sm w-max">
          <WifiOff className="w-5 h-5" />
          Failed to sync live data. Retrying in background...
        </div>
      )}

      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans pb-24">

      {loading && !stats ? (
        <LiveMonitoringSkeleton />
      ) : (
        <>
          {/* SECTION 1: System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PremiumSummaryCard 
              title="Average AQI" 
              value={stats?.averageAQI === null ? '--' : stats?.averageAQI} 
              total={500} 
              trendVal="Live"
              trendDir="none"
              trendPeriod="today"
              statusText={stats?.averageAQI === null ? 'Waiting' : 'Live Sync'}
              icon={Globe} 
              themeColor="#22c55e" 
              gradientBg="from-green-50/40 to-transparent"
              delay={0.1}
              percentageOverride={stats?.averageAQI === null ? 0 : (stats.averageAQI / 500) * 100}
            />
            <PremiumSummaryCard 
              title="Active Sensors" 
              value={stats?.onlineDevices || 0} 
              total={stats?.totalDevices || 0} 
              trendVal={`${stats?.offlineDevices || 0} offline`}
              trendDir={stats?.offlineDevices > 0 ? 'down' : 'up'}
              trendPeriod=""
              statusText={stats?.totalDevices === 0 ? 'Waiting' : 'Online'}
              icon={Radio} 
              themeColor="#0ea5e9" 
              gradientBg="from-sky-50/40 to-transparent"
              delay={0.2}
            />
            <PremiumSummaryCard 
              title="Active Alerts" 
              value={stats?.activeAlerts || 0} 
              total={stats?.activeAlerts || 0} 
              trendVal={stats?.activeAlerts > 0 ? 'Action needed' : 'All clear'}
              trendDir={stats?.activeAlerts > 0 ? 'down' : 'up'}
              trendPeriod=""
              statusText={stats?.activeAlerts > 0 ? 'High Priority' : 'Safe'}
              icon={AlertTriangle} 
              themeColor="#ef4444" 
              gradientBg="from-red-50/40 to-transparent"
              delay={0.3}
              percentageOverride={stats?.activeAlerts > 0 ? 100 : 0}
            />
            <PremiumSummaryCard 
              title="System Health" 
              value={stats?.systemHealthPercentage || 100}
              total={100} 
              trendVal="Live"
              trendDir={stats?.systemHealth === 'Healthy' ? 'up' : 'down'}
              trendPeriod=""
              statusText={stats?.systemHealth || 'Unknown'}
              icon={Activity} 
              themeColor={stats?.systemHealth === 'Healthy' ? '#3b82f6' : stats?.systemHealth === 'Warning' ? '#f59e0b' : '#ef4444'}
              gradientBg="from-blue-50/40 to-transparent"
              delay={0.4}
              percentageOverride={stats?.systemHealthPercentage || 100}
            />
          </div>

          {/* SECTION 2 & 3: Camera Feed and Current Incident */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Camera Feed - The visual centerpiece */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="xl:col-span-2 relative rounded-[32px] overflow-hidden bg-[#0A111F] min-h-[580px] shadow-[0_20px_50px_rgba(15,23,42,0.3)] border border-[#1E293B]"
            >
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />
              
              {/* Top Info Bar */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 bg-gradient-to-b from-[#0A111F]/90 via-[#0A111F]/40 to-transparent">
                <div className="flex items-center gap-4">
                  <motion.div 
                    animate={cameraNode?.status === 'Online' ? { opacity: [0.85, 1, 0.85], scale: [1, 1.02, 1] } : {}} 
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`flex items-center gap-2 px-4 py-2 ${cameraNode?.status === 'Online' ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-500/10 border-slate-500/20'} backdrop-blur-xl border rounded-full`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${cameraNode?.status === 'Online' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-500'}`} />
                    <span className={`${cameraNode?.status === 'Online' ? 'text-red-400' : 'text-slate-400'} text-[13px] font-bold tracking-widest uppercase`}>
                      {cameraNode?.status === 'Online' ? 'Live Stream' : 'Stream Offline'}
                    </span>
                  </motion.div>
                  <div className="px-4 py-2 bg-[#0F172A]/60 backdrop-blur-xl border border-white/5 rounded-full flex items-center gap-2 text-white/90 text-[13px] font-medium tracking-wide uppercase">
                    <Clock className="w-4 h-4 text-[#7DD3FC]" />
                    {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#0F172A]/60 backdrop-blur-xl border border-white/5 rounded-full text-[12px] font-mono text-white/70">
                    <span>RES: <span className="text-white font-bold">{cameraNode ? '4K UHD' : '--'}</span></span>
                  </div>
                </div>
              </div>

              {/* Central Content Area (Perfectly Centered) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-8">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#7DD3FC 1px, transparent 1px), linear-gradient(90deg, #7DD3FC 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative flex flex-col items-center mb-8 z-10">
                  {cameraNode?.detectionType && cameraNode.detectionType !== 'None' && (
                    <div className="absolute -top-10 bg-[#0EA5E9]/10 backdrop-blur-md text-[#7DD3FC] border border-[#38BDF8]/40 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.15)] whitespace-nowrap">
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-[#38BDF8]/10 rounded-full blur-md"
                      />
                      <ShieldAlert className="w-3.5 h-3.5 text-[#38BDF8] z-10" />
                      <span className="z-10">{cameraNode.detectionType.toUpperCase()} SIGNATURE DETECTED</span>
                    </div>
                  )}

                  {/* Bounding Box */}
                  <div className="w-[320px] h-[220px] border border-[#7DD3FC]/30 bg-[#7DD3FC]/[0.02] rounded-lg flex items-center justify-center backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#38BDF8] rounded-tl-sm opacity-70" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#38BDF8] rounded-tr-sm opacity-70" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#38BDF8] rounded-bl-sm opacity-70" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#38BDF8] rounded-br-sm opacity-70" />
                    
                    <motion.div 
                      animate={cameraNode?.status === 'Online' ? { opacity: [0.6, 1, 0.6] } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative flex items-center justify-center"
                    >
                      <Camera className="w-16 h-16 text-[#7DD3FC]/40" strokeWidth={1} />
                      {cameraNode?.status === 'Online' && (
                        <motion.div 
                          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }} 
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-[#7DD3FC] rounded-full blur-2xl -z-10"
                        />
                      )}
                    </motion.div>
                    
                    {cameraNode?.status === 'Online' && (
                      <motion.div 
                        animate={{ y: [0, 220, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7DD3FC] to-transparent opacity-30 shadow-[0_0_10px_#7DD3FC]" 
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center px-6 z-10">
                  {cameraNode?.status === 'Online' ? (
                    <>
                      <p className="text-[#38BDF8] font-mono text-[13px] tracking-[0.2em] uppercase font-semibold mb-3 bg-[#0EA5E9]/10 px-3 py-1 rounded-full border border-[#0EA5E9]/20 inline-block">
                        Signal Acquired
                      </p>
                      <h3 className="text-white/95 text-[28px] font-semibold tracking-wide shadow-sm">
                        Waiting for ESP32-CAM Video Stream...
                      </h3>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 font-mono text-[13px] tracking-[0.2em] uppercase font-semibold mb-3 bg-slate-500/10 px-3 py-1 rounded-full border border-slate-500/20 inline-block">
                        No Signal
                      </p>
                      <h3 className="text-white/40 text-[28px] font-semibold tracking-wide shadow-sm">
                        Camera Offline or Not Connected
                      </h3>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-[#0A111F]/80 backdrop-blur-xl border-t border-white/5 p-5 flex flex-wrap gap-6 items-center justify-center z-20">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cameraNode?.status === 'Online' ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-slate-500'}`} />
                  <span className="text-white/90 font-mono text-[13px] font-medium tracking-wider">{cameraNode?.sensorId || 'N/A'}</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="text-white/70 text-[13px] font-medium tracking-wide">
                  <MapPin className="w-4 h-4 inline mr-1 text-[#7DD3FC]"/> {cameraNode?.location || '--'}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/70 text-[13px] font-mono font-medium tracking-wide">
                   <Cpu className="w-4 h-4 text-[#7DD3FC]" />
                   AWARE-Net v2.4
                </div>
                <div className="flex-1" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest border ${cameraNode?.status === 'Online' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {cameraNode?.status === 'Online' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      UPLINK STABLE
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      UPLINK OFFLINE
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Current Incident */}
            <GlassCard delay={0.6} className={`xl:col-span-1 border-l-[6px] ${latestAlert ? 'border-l-orange-500' : 'border-l-green-500'} p-8 h-full flex flex-col relative overflow-hidden`}>
              {latestAlert ? (
                <>
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 text-orange-500/5 rotate-12">
                    <ShieldAlert className="w-64 h-64" />
                  </div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Active Incident</h2>
                    <div className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[12px] font-bold tracking-widest uppercase border border-red-200 shadow-sm flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {latestAlert.severity}
                    </div>
                  </div>
                  
                  <div className="space-y-7 relative z-10 flex-1">
                    <div>
                      <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-2">Detection Signature</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                          <ShieldAlert className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-[#0F172A] font-bold text-[18px]">{latestAlert.type}</h3>
                          <p className="text-[#64748B] text-[14px] font-medium mt-0.5 truncate max-w-[200px]">{latestAlert.message}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-[#F8FBFF] p-5 rounded-2xl border border-[#DCEEFF]">
                      <div>
                        <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-1">Local AQI</p>
                        <p className="text-[#0F172A] font-bold text-[28px] tracking-tight">{latestAlert.aqiAtTime || '--'} <span className="text-[14px] font-medium text-slate-400">Recorded</span></p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-1">Sensor</p>
                        <p className="text-[#3B82F6] font-bold text-[18px] tracking-tight mt-1 truncate">{latestAlert.sensorId}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-0.5">Location</p>
                          <p className="text-[#0F172A] font-medium text-[15px]">{latestAlert.location || '--'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest mb-0.5">Time Logged</p>
                          <p className="text-[#0F172A] font-medium text-[15px]">{new Date(latestAlert.timestamp).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-[#DCEEFF] relative z-10">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                         <BellRing className="w-4 h-4 text-orange-500" /> Alert Dispatched
                       </div>
                       <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A] col-span-2">
                         <UserCheck className="w-4 h-4 text-[#3B82F6]" /> Assigned: Dept of Environment
                       </div>
                     </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 text-green-500/5 rotate-12">
                    <Shield className="w-64 h-64" />
                  </div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Active Incident</h2>
                    <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[12px] font-bold tracking-widest uppercase border border-green-200 shadow-sm flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Clear
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 text-slate-400 pb-10">
                    <Shield className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="font-semibold text-slate-600">No active incidents</p>
                    <p className="text-sm mt-2 max-w-[200px]">Waiting for ESP32 alerts or AI camera detections.</p>
                  </div>
                </>
              )}
            </GlassCard>
          </div>
          
          {/* SECTION 4: Connected Devices Grid */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> Connected Hardware Nodes
            </h3>
            
            {sensors.length === 0 ? (
               <div className="bg-white/50 backdrop-blur-md rounded-[24px] border border-dashed border-[#DCEEFF] p-12 text-center flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                    <Power className="w-8 h-8 text-slate-400" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700">No devices connected</h4>
                 <p className="text-slate-500 mt-2">Waiting for ESP32 hardware to register with the backend.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sensors.map((device, i) => {
                  const isOnline = device.status === 'Online';
                  const isCam = device.cameraId && device.cameraId !== 'None';
                  
                  // Calculate mock health based on lastUpdated (if within 5 mins, 100%, otherwise decays)
                  let health = 0;
                  if (device.lastUpdated) {
                     const diffMins = (Date.now() - new Date(device.lastUpdated).getTime()) / 60000;
                     health = Math.max(0, 100 - Math.floor(diffMins));
                     if (!isOnline) health = 0;
                  }

                  const colors = isOnline ? {
                    bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", 
                    indicator: "bg-emerald-500", progressBg: "bg-emerald-100", progress: "bg-emerald-500",
                    iconBg: "from-emerald-50 to-emerald-100/50"
                  } : {
                    bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                    indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                    iconBg: "from-slate-50 to-slate-100/50"
                  };

                  return (
                    <GlassCard key={device._id} delay={1.0 + (i * 0.05)} className="p-6">
                      <div className="flex flex-col h-full relative z-10">
                        {/* Header: Icon & Badges */}
                        <div className="flex items-start justify-between mb-5">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} border ${colors.border} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            {isCam ? <Camera className={`w-6 h-6 ${colors.text}`} /> : <Cpu className={`w-6 h-6 ${colors.text}`} />}
                          </div>
                          <div className={`px-2.5 py-1 rounded-full ${colors.bg} border ${colors.border} ${colors.text} flex items-center gap-1.5 shadow-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.indicator} ${isOnline ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{device.status}</span>
                          </div>
                        </div>

                        {/* Identity */}
                        <div className="mb-6">
                          <h4 className="font-bold text-[#0F172A] text-[16px] truncate" title={device.sensorId}>{device.sensorId}</h4>
                          <p className="text-[#64748B] text-[13px] font-medium mt-0.5 truncate">{device.location || 'Unknown Location'}</p>
                        </div>

                        {/* Health Score */}
                        <div className="mb-5">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Health Score</span>
                            <span className={`text-[14px] font-bold ${colors.text}`}>{health}%</span>
                          </div>
                          <div className={`w-full h-1.5 ${colors.progressBg} rounded-full overflow-hidden`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${health}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full ${colors.progress} rounded-full relative`}
                            >
                              {isOnline && <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-[shimmer_2s_infinite]" />}
                            </motion.div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-auto pt-5 border-t border-[#F1F5F9]">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Current AQI</p>
                            <p className="text-[#0F172A] font-semibold text-[13px]">{device.aqi || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Last Sync</p>
                            <p className="text-[#0F172A] font-semibold text-[13px] truncate">
                              {device.lastUpdated ? new Date(device.lastUpdated).toLocaleTimeString('en-IN') : '--'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Helper SVGs */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(600px); }
        }
        .animate-scan {
          animation: scan 3.5s linear infinite;
        }
      `}</style>
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

export default LiveMonitoring;
