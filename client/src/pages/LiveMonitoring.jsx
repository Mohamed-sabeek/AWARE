import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  AlertTriangle, 
  Activity, 
  Camera, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  Database, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Wifi, 
  WifiOff, 
  Gauge, 
  Image as ImageIcon 
} from 'lucide-react';
import api, { API_URL } from '../services/api';
import { getSocket } from '../services/socket';
import { getEvidenceImageUrl } from '../utils/imageUrl';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';

// Premium Glass Card Wrapper
const GlassCard = ({ 
  children, 
  className = "", 
  delay = 0, 
  glowColor = "rgba(96, 165, 250, 0.15)", 
  noHoverGlow = false 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, boxShadow: `0 20px 35px -10px ${glowColor}, 0 8px 16px -8px rgba(96, 165, 250, 0.08)` }}
    className={`bg-white/95 backdrop-blur-xl rounded-[24px] border border-[#DCEEFF] p-7 shadow-[0_8px_30px_rgba(96,165,250,0.04)] transition-all overflow-hidden relative group flex flex-col ${className}`}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 bg-white/60 rounded-[24px] border border-[#E2F0FF]" />
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 h-[560px] bg-slate-800/40 rounded-[32px]" />
      <div className="xl:col-span-1 h-[560px] bg-white/60 rounded-[24px] border border-[#E2F0FF]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-white/60 rounded-[24px] border border-[#E2F0FF]" />
      ))}
    </div>
  </div>
);

const formatBackendTimestamp = (timestamp) => {
  if (!timestamp) return 'Standby';
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? 'Standby' : d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const LiveMonitoring = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [liveSensor, setLiveSensor] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [latestEvidence, setLatestEvidence] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'LIVE' | 'CONNECTING' | 'DISCONNECTED'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TARGET_DEVICE_ID = 'ESP32-CAM-001';
  const streamUrl = `${API_URL}/live/stream/${TARGET_DEVICE_ID}`;

  // 1. Initial Data Fetch from Backend REST endpoints (Reuses proven Dashboard logic)
  const fetchMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, sensorsRes, evidenceRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/sensors'),
        api.get('/evidence?limit=1')
      ]);

      if (dashboardRes.status === 'fulfilled') {
        const stats = dashboardRes.value.data;
        setDashboardStats(stats);
        if (stats?.latestEvidence) {
          setLatestEvidence(stats.latestEvidence);
          setImageError(false);
        }
      }

      if (evidenceRes.status === 'fulfilled') {
        const eData = evidenceRes.value.data?.data || evidenceRes.value.data || [];
        if (Array.isArray(eData) && eData.length > 0) {
          setLatestEvidence(eData[0]);
          setImageError(false);
        }
      }

      if (sensorsRes.status === 'fulfilled') {
        const rawList = sensorsRes.value.data || [];
        // Deduplicate devices by normalized sensorId
        const uniqueSensors = [];
        const seen = new Set();
        for (const s of rawList) {
          const normId = (s.sensorId || '').replace(/_/g, '-');
          if (!seen.has(normId)) {
            seen.add(normId);
            uniqueSensors.push(s);
          }
        }
        setSensors(uniqueSensors);

        const targetSensor = rawList.find(s => s.sensorId === TARGET_DEVICE_ID) || rawList[0] || null;
        if (targetSensor) {
          setLiveSensor(targetSensor);
        }
      }

      if (dashboardRes.status === 'rejected' && sensorsRes.status === 'rejected') {
        setError('Unable to load sensor data from backend');
      }
    } catch (err) {
      console.error('Failed to fetch live monitoring data:', err);
      setError('Unable to load sensor data');
    } finally {
      setLoading(false);
    }
  }, [TARGET_DEVICE_ID]);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // 2. Real-Time Socket.io Integration (Reuses proven Dashboard subscription)
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnectionStatus('LIVE');
    };

    const onDisconnect = () => {
      setConnectionStatus('DISCONNECTED');
    };

    const onConnectError = () => {
      setConnectionStatus('DISCONNECTED');
    };

    if (socket.connected) {
      setConnectionStatus('LIVE');
    } else {
      setConnectionStatus('CONNECTING');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Incoming real-time sensor reading (~1s from ESP32)
    const onSensorReading = (data) => {
      if (!data) return;
      const incomingDeviceId = data.deviceId || data.sensorId;
      if (incomingDeviceId !== TARGET_DEVICE_ID) return;

      const newVoltage = typeof data.voltage === 'number' ? data.voltage : parseFloat(data.voltage) || 0;
      const newThreshold = data.threshold !== undefined ? data.threshold : (liveSensor?.threshold || 0.400);
      const newTimestamp = data.timestamp || new Date().toISOString();

      // Immediately update current sensor state with exact backend timestamp
      setLiveSensor(prev => ({
        ...(prev || {}),
        sensorId: incomingDeviceId,
        voltage: newVoltage,
        threshold: newThreshold,
        status: 'Online',
        lastUpdated: newTimestamp
      }));

      // Update matching sensor in device list
      setSensors(prev => prev.map(s => {
        if (s.sensorId === incomingDeviceId) {
          return {
            ...s,
            voltage: newVoltage,
            status: 'Online',
            lastUpdated: newTimestamp
          };
        }
        return s;
      }));
    };

    // Incoming visual evidence capture from ESP32-CAM
    const onEvidenceCaptured = (data) => {
      if (!data) return;
      setLatestEvidence(data);
      setImageError(false);
    };

    socket.on('sensor-reading', onSensorReading);
    socket.on('evidence-captured', onEvidenceCaptured);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('sensor-reading', onSensorReading);
      socket.off('evidence-captured', onEvidenceCaptured);
    };
  }, [TARGET_DEVICE_ID, liveSensor?.threshold]);

  // Derived Realtime Values (Threshold: 0.400 V)
  const currentVoltage = liveSensor?.voltage !== undefined 
    ? liveSensor.voltage 
    : (dashboardStats?.latestReading?.voltage !== undefined ? dashboardStats.latestReading.voltage : 0);

  const threshold = liveSensor?.threshold !== undefined 
    ? liveSensor.threshold 
    : 0.400;

  const deviceId = liveSensor?.sensorId || TARGET_DEVICE_ID;
  const isAlert = currentVoltage >= threshold;
  const status = isAlert ? 'ALERT' : 'NORMAL';
  const isOnline = liveSensor?.status ? liveSensor.status.toLowerCase() === 'online' : true;
  const locationLabel = liveSensor?.location || 'ESP32 Station';

  const hasRealEvidence = Boolean(latestEvidence && latestEvidence.imageUrl);
  const evidenceImageUrl = hasRealEvidence ? getEvidenceImageUrl(latestEvidence.imageUrl) : '';
  const lastSyncTime = formatBackendTimestamp(liveSensor?.lastUpdated);
  const evidenceTimeFormatted = formatBackendTimestamp(latestEvidence?.createdAt || latestEvidence?.timestamp);
  
  const evidenceVoltageVal = latestEvidence?.voltage !== undefined 
    ? `${Number(latestEvidence.voltage).toFixed(3)} V` 
    : (latestEvidence?.metadata?.voltage !== undefined ? `${Number(latestEvidence.metadata.voltage).toFixed(3)} V` : `${currentVoltage.toFixed(3)} V`);

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader 
        title="Live Monitoring"
        description="Real-time gas sensor surveillance, camera uplink status, and automated threshold alerts."
      />
      
      {error && (
        <div className="mx-8 mt-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 flex items-center gap-3 text-sm font-semibold shadow-sm w-max">
          <WifiOff className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans pb-24">

      {loading && !dashboardStats && !liveSensor ? (
        <LiveMonitoringSkeleton />
      ) : (
        <>
          {/* ========================================================= */}
          {/* SECTION A: Current Sensor & Status Overview (No AQI)      */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. CURRENT SENSOR READING */}
            <PremiumSummaryCard 
              title="Current Reading" 
              value={`${currentVoltage.toFixed(3)} V`} 
              total={1.0} 
              trendVal={`Threshold: ${threshold.toFixed(3)} V`}
              trendDir={isAlert ? 'down' : 'up'}
              trendPeriod=""
              statusText={status}
              icon={Gauge} 
              themeColor={isAlert ? '#ef4444' : '#22c55e'} 
              gradientBg={isAlert ? 'from-red-50/40 to-transparent' : 'from-emerald-50/40 to-transparent'}
              delay={0.1}
              percentageOverride={Math.min((currentVoltage / threshold) * 100, 100)}
            />

            {/* 2. SENSOR STATUS */}
            <PremiumSummaryCard 
              title="Sensor Status" 
              value={status} 
              total={1} 
              trendVal={`Device: ${deviceId}`}
              trendDir={isAlert ? 'down' : 'up'}
              trendPeriod=""
              statusText={isAlert ? 'BREACH ACTIVE' : 'NORMAL'}
              icon={Activity} 
              themeColor={isAlert ? '#ef4444' : '#10b981'} 
              gradientBg={isAlert ? 'from-red-50/40 to-transparent' : 'from-emerald-50/40 to-transparent'}
              delay={0.2}
              percentageOverride={isAlert ? 100 : 0}
            />

            {/* 3. CONNECTED HARDWARE */}
            <PremiumSummaryCard 
              title="Connected Hardware" 
              value={isOnline ? 1 : 0} 
              total={1} 
              trendVal={`Last Sync: ${lastSyncTime}`}
              trendDir={isOnline ? 'up' : 'down'}
              trendPeriod=""
              statusText={isOnline ? 'Online' : 'Offline'}
              icon={Radio} 
              themeColor="#0ea5e9" 
              gradientBg="from-sky-50/40 to-transparent"
              delay={0.3}
            />

            {/* 4. SOCKET.IO CONNECTION */}
            <PremiumSummaryCard 
              title="Connection Status" 
              value={connectionStatus === 'LIVE' ? 'LIVE SYNC' : connectionStatus}
              total={100} 
              trendVal={connectionStatus === 'LIVE' ? 'Realtime Connected' : 'Reconnecting...'}
              trendDir={connectionStatus === 'LIVE' ? 'up' : 'down'}
              trendPeriod=""
              statusText={connectionStatus === 'LIVE' ? 'CONNECTED' : 'DISCONNECTED'}
              icon={connectionStatus === 'LIVE' ? Wifi : WifiOff} 
              themeColor={connectionStatus === 'LIVE' ? '#3b82f6' : '#f59e0b'} 
              gradientBg="from-blue-50/40 to-transparent"
              delay={0.4}
              percentageOverride={connectionStatus === 'LIVE' ? 100 : 30}
            />
          </div>

          {/* ========================================================= */}
          {/* SECTION B & C: Live Camera Panel & Active Incident Panel  */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* LIVE CAMERA PANEL (Stream-Ready Container) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="xl:col-span-2 relative rounded-[32px] overflow-hidden bg-[#0A111F] min-h-[560px] shadow-[0_20px_50px_rgba(15,23,42,0.3)] border border-[#1E293B] flex flex-col justify-between"
            >
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />
              
              {/* Top Info Bar */}
              <div className="w-full p-6 flex flex-wrap justify-between items-center z-20 bg-gradient-to-b from-[#0A111F]/95 via-[#0A111F]/60 to-transparent gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 ${connectionStatus === 'LIVE' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'} backdrop-blur-xl border rounded-full`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
                    <span className={`text-[12px] font-bold tracking-widest uppercase ${connectionStatus === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ● LIVE CAMERA
                    </span>
                  </div>
                  
                  <div className="px-3.5 py-2 bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-full text-white/90 text-[12px] font-mono font-semibold">
                    {deviceId}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 text-white/80 text-[12px] font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#7DD3FC]" />
                    <span>Last Sync: {lastSyncTime}</span>
                  </div>
                  <div className="px-3.5 py-2 bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-full text-[11px] font-mono text-white/70">
                    RES: <span className="text-white font-bold">320x240 QVGA</span>
                  </div>
                </div>
              </div>

              {/* Central Viewfinder Area (ESP32-CAM MJPEG Stream) */}
              <div className="relative flex-1 flex flex-col items-center justify-center p-6 md:p-8 z-10">
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(#7DD3FC 1px, transparent 1px), linear-gradient(90deg, #7DD3FC 1px, transparent 1px)', 
                    backgroundSize: '36px 36px' 
                  }} 
                />

                {/* Stream Frame Container */}
                <div className="relative w-full max-w-[760px] aspect-video rounded-2xl overflow-hidden border border-[#7DD3FC]/30 bg-black shadow-2xl flex items-center justify-center group">
                  {!streamError ? (
                    <>
                      <img 
                        src={streamUrl} 
                        alt="ESP32-CAM Live Stream" 
                        className="w-full h-full object-cover"
                        onLoad={() => setStreamLoaded(true)}
                        onError={() => setStreamError(true)}
                      />
                      
                      {/* Live HUD Corner Brackets */}
                      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#38BDF8] rounded-tl-sm pointer-events-none" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#38BDF8] rounded-tr-sm pointer-events-none" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#38BDF8] rounded-bl-sm pointer-events-none" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#38BDF8] rounded-br-sm pointer-events-none" />

                      {/* Live Streaming Badge Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[10px] font-mono text-white pointer-events-none shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                        <span className="font-bold tracking-wider">LIVE FEED</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/90">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <h4 className="text-white font-bold text-base">Camera Stream Disconnected</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{streamUrl}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Ensure ESP32-CAM is powered on and reachable on the local network.</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setStreamError(false);
                          setStreamLoaded(false);
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                      >
                        Retry Stream Connection
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="w-full bg-[#0A111F]/90 backdrop-blur-xl border-t border-white/10 p-4 px-6 flex flex-wrap gap-4 items-center justify-between z-20 text-xs font-mono text-white/80">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-slate-500'}`} />
                    <span className="text-white font-bold">{deviceId}</span>
                  </div>
                  <div className="h-3.5 w-px bg-white/15" />
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#7DD3FC]" />
                    <span>{locationLabel}</span>
                  </div>
                  <div className="h-3.5 w-px bg-white/15 hidden sm:inline" />
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                    <Cpu className="w-3.5 h-3.5 text-[#7DD3FC]" />
                    <span>ADS1115 (16-Bit)</span>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border ${connectionStatus === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {connectionStatus === 'LIVE' ? 'UPLINK STABLE' : connectionStatus}
                </div>
              </div>
            </motion.div>

            {/* ACTIVE INCIDENT PANEL (Always shows latest real evidence image independently) */}
            <GlassCard 
              delay={0.5} 
              className={`xl:col-span-1 border-l-[6px] ${isAlert ? 'border-l-red-500' : 'border-l-emerald-500'} p-7 h-full flex flex-col relative overflow-hidden`}
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 -mr-16 -mt-16 ${isAlert ? 'text-red-500/5' : 'text-emerald-500/5'} rotate-12 pointer-events-none`}>
                {isAlert ? <ShieldAlert className="w-64 h-64" /> : <Shield className="w-64 h-64" />}
              </div>

              {/* Panel Header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{isAlert ? '🚨' : '🛡️'}</span>
                  <h2 className="text-[20px] font-black text-slate-900 tracking-tight">
                    Active Incident
                  </h2>
                </div>
                {isAlert ? (
                  <div className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-black tracking-wider uppercase shadow-md animate-pulse flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    ACTIVE
                  </div>
                ) : (
                  <div className="px-3.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold tracking-wider uppercase border border-emerald-200 shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    CLEAR
                  </div>
                )}
              </div>

              {/* LATEST REAL EVIDENCE IMAGE (Always displayed if exists, even when status is CLEAR) */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-900 border border-slate-700/80 overflow-hidden mb-5 shadow-sm group">
                {hasRealEvidence && !imageError ? (
                  <img 
                    src={evidenceImageUrl} 
                    alt="ESP32-CAM Live Evidence" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-slate-900 text-slate-400">
                    <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-xs font-semibold text-slate-300">
                      {imageError ? 'Evidence image unavailable' : 'No evidence captured yet'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {imageError ? 'Check upload path / server connection' : 'ESP32-CAM visual sensor standby'}
                    </span>
                  </div>
                )}

                {/* Overlaid watermark */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2.5 flex justify-between items-center text-[10px] font-mono text-white pointer-events-none z-10">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : (hasRealEvidence ? 'bg-emerald-400' : 'bg-slate-400')}`} />
                    {isAlert ? 'REC: THRESHOLD BREACH' : (hasRealEvidence ? 'REC: LATEST EVIDENCE' : 'REC: STANDBY')}
                  </span>
                  <span>{evidenceTimeFormatted}</span>
                </div>
              </div>

              {/* Incident / Sensor Metric Details */}
              <div className="space-y-4 relative z-10 flex-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Incident Status
                  </span>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${isAlert ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-sm font-bold ${isAlert ? 'text-red-700' : 'text-slate-700'}`}>
                      {isAlert ? '🚨 Active Threshold Incident' : 'No active incident'}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${isAlert ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isAlert ? 'ACTIVE' : 'CLEAR'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Reading
                    </span>
                    <span className={`text-lg font-black ${isAlert ? 'text-red-600' : 'text-emerald-600'}`}>
                      {currentVoltage.toFixed(3)} V
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Threshold</span>
                    <span className="text-lg font-bold text-slate-700">{threshold.toFixed(3)} V</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Device</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {latestEvidence?.sensorId || latestEvidence?.deviceId || deviceId}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Evidence Time</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {evidenceTimeFormatted}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Evidence Location</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      {latestEvidence?.locationName || latestEvidence?.location ? (
                        <span>
                          {latestEvidence.locationName || latestEvidence.location}
                          {latestEvidence.latitude !== null && latestEvidence.latitude !== undefined && latestEvidence.longitude !== null && latestEvidence.longitude !== undefined && (
                            <span className="text-slate-500 font-mono text-[11px] ml-1.5 font-normal">
                              ({Number(latestEvidence.latitude).toFixed(6)}, {Number(latestEvidence.longitude).toFixed(6)})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Location not configured</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Panel Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 relative z-10 flex items-center justify-between text-xs font-medium">
                {isAlert ? (
                  <>
                    <span className="flex items-center gap-1.5 text-red-700">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      5s Periodic Capture Active
                    </span>
                    <span className="font-mono text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">
                      STATUS: ACTIVE
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      No active threshold breach
                    </span>
                    <span className="font-mono text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                      STATUS: CLEAR
                    </span>
                  </>
                )}
              </div>
            </GlassCard>
          </div>
          
          {/* ========================================================= */}
          {/* SECTION D: Connected Hardware Nodes (Single Real Device)  */}
          {/* ========================================================= */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> Connected Hardware Node
            </h3>
            
            {sensors.length === 0 ? (
               <div className="bg-white/50 backdrop-blur-md rounded-[24px] border border-dashed border-[#DCEEFF] p-12 text-center flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                    <Power className="w-8 h-8 text-slate-400" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700">No devices connected</h4>
                 <p className="text-slate-500 mt-2">Waiting for ESP32 hardware node to register with backend.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sensors.map((device, i) => {
                  const isNodeOnline = device.status?.toLowerCase() === 'online';
                  const deviceVoltage = device.sensorId === TARGET_DEVICE_ID 
                    ? currentVoltage 
                    : (device.voltage !== undefined ? device.voltage : 0);

                  const colors = isNodeOnline ? {
                    bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", 
                    indicator: "bg-emerald-500", progressBg: "bg-emerald-100", progress: "bg-emerald-500",
                    iconBg: "from-emerald-50 to-emerald-100/50"
                  } : {
                    bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", 
                    indicator: "bg-slate-400", progressBg: "bg-slate-100", progress: "bg-slate-400",
                    iconBg: "from-slate-50 to-slate-100/50"
                  };

                  return (
                    <GlassCard key={device._id || device.sensorId || i} delay={0.6 + (i * 0.05)} className="p-6">
                      <div className="flex flex-col h-full relative z-10">
                        {/* Header: Icon & Badges */}
                        <div className="flex items-start justify-between mb-5">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} border ${colors.border} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            <Camera className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <div className={`px-2.5 py-1 rounded-full ${colors.bg} border ${colors.border} ${colors.text} flex items-center gap-1.5 shadow-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.indicator} ${isNodeOnline ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{isNodeOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>

                        {/* Identity */}
                        <div className="mb-5">
                          <h4 className="font-bold text-[#0F172A] text-[16px] truncate" title={device.sensorId}>
                            {device.sensorId}
                          </h4>
                          <p className="text-[#64748B] text-[13px] font-medium mt-0.5 truncate">
                            {device.location || 'ESP32 Station'}
                          </p>
                        </div>

                        {/* Hardware Details */}
                        <div className="space-y-2 mb-5 text-xs">
                          <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-semibold">Microcontroller:</span>
                            <span className="font-bold text-slate-700">ESP32-CAM</span>
                          </div>
                          <div className="flex justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-semibold">Converter:</span>
                            <span className="font-bold text-slate-700">ADS1115 (16-Bit)</span>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-[#F1F5F9]">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Live Reading</p>
                            <p className="text-[#0F172A] font-black text-[13px] font-mono">
                              {typeof deviceVoltage === 'number' ? `${deviceVoltage.toFixed(3)} V` : '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Last Sync</p>
                            <p className="text-[#0F172A] font-semibold text-[12px] truncate font-mono">
                              {formatBackendTimestamp(device.lastUpdated)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default LiveMonitoring;
