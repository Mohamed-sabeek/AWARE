import React from 'react';
import { 
  Activity, 
  Cpu, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Layers, 
  Camera, 
  AlertTriangle, 
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { getEvidenceImageUrl } from '../../utils/imageUrl';

export const GlassCard = React.memo(({ children, className = '' }) => (
  <div
    className={`bg-white border border-[#DCEEFF] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(96,165,250,0.03)] hover:shadow-md transition-shadow duration-200 relative overflow-hidden flex flex-col ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-blue-50/20 pointer-events-none z-0" />
    <div className="relative z-10 flex-1 flex flex-col">{children}</div>
  </div>
));
GlassCard.displayName = 'GlassCard';

// 1. MAIN LIVE SENSOR READING (Hero Element)
export const LiveGasSensorHero = React.memo(({ 
  reading = "0.000 V", 
  status = "NORMAL", 
  device = "ESP32-CAM-001",
  timestamp = null,
  isOnline = true,
  connectionStatus = "LIVE"
}) => {
  const isAlert = status === 'ALERT';
  const displayReading = typeof reading === 'number' ? `${reading.toFixed(3)} V` : reading;
  const isLive = connectionStatus === 'LIVE';
  const isConnecting = connectionStatus === 'CONNECTING';

  return (
    <div
      className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A192F] rounded-[28px] p-7 md:p-9 text-white shadow-[0_12px_36px_rgba(15,23,42,0.12)] border border-slate-700/60 overflow-hidden"
    >
      {/* Static background ambient lighting */}
      <div className={`absolute top-0 right-0 w-80 h-80 ${isAlert ? 'bg-red-500/15' : 'bg-blue-500/10'} rounded-full blur-2xl pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 w-64 h-64 ${isAlert ? 'bg-amber-500/10' : 'bg-emerald-500/10'} rounded-full blur-2xl pointer-events-none`} />

      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${isAlert ? 'from-[#DC2626] to-[#F87171] shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'from-[#2563EB] to-[#60A5FA] shadow-[0_0_20px_rgba(59,130,246,0.4)]'} flex items-center justify-center`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] md:text-[22px] font-black tracking-tight text-white">
                  Live Gas Sensor
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 text-blue-400" /> MQ + ADS1115
                </span>
              </div>
              <p className="text-[13px] text-slate-400 font-medium">
                Real-time analog voltage acquisition via 16-Bit precision ADC
              </p>
            </div>
          </div>

          {/* Realtime Socket connection badge */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
            isLive 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : isConnecting 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
              : 'bg-slate-700/50 border-slate-600 text-slate-400'
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              {isConnecting && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLive ? 'bg-emerald-500' : isConnecting ? 'bg-amber-500' : 'bg-slate-500'
              }`}></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">
              {isLive ? 'LIVE STREAM' : isConnecting ? 'CONNECTING...' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Center Main Value Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-2">
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-400' : 'bg-[#60A5FA]'}`} /> Current Reading
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={`text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text ${isAlert ? 'bg-gradient-to-r from-red-200 via-white to-red-400' : 'bg-gradient-to-r from-white via-slate-100 to-blue-200'} tracking-tight font-mono`}>
                {displayReading}
              </span>
              <span className="text-sm md:text-base font-semibold text-blue-300/80 bg-blue-950/60 border border-blue-800/50 px-3 py-1 rounded-xl">
                Analog Voltage (ADC)
              </span>
            </div>
          </div>

          {/* Right Status & Device details */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            {/* Status pill */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status
              </span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-xl ${isAlert ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'} border`}>
                <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`} />
                <span className="text-sm font-black tracking-wide">{status}</span>
              </div>
            </div>

            {/* Device pill */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Device
              </span>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-200 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                {device}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} /> {isOnline ? 'Connected' : 'Offline'}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline">Sensor: MQ-Series Gas Detector</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline">Converter: ADS1115 (16-Bit I2C)</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            {timestamp ? `Last Sync: ${new Date(timestamp).toLocaleTimeString()}` : 'Backend Synced'}
          </div>
        </div>

      </div>
    </div>
  );
});
LiveGasSensorHero.displayName = 'LiveGasSensorHero';

// 2. THRESHOLD COMPARISON CARD
export const ThresholdCard = React.memo(({ 
  threshold = 0.400, 
  current = 0.000, 
  status = "NORMAL" 
}) => {
  const thresholdNum = typeof threshold === 'number' ? threshold : parseFloat(threshold) || 0.400;
  const currentNum = typeof current === 'number' ? current : parseFloat(current) || 0;
  const percentage = thresholdNum > 0 ? Math.min(Math.round((currentNum / thresholdNum) * 100), 100) : 0;
  const headroomVal = thresholdNum - currentNum;
  const isSafe = currentNum < thresholdNum;
  const headroomText = isSafe ? `+${headroomVal.toFixed(3)} V safe margin` : `${Math.abs(headroomVal).toFixed(3)} V at or above threshold`;

  const thresholdDisplay = typeof threshold === 'string' && threshold.includes('V') ? threshold : `${thresholdNum.toFixed(3)} V`;
  const currentDisplay = typeof current === 'string' && current.includes('V') ? current : `${currentNum.toFixed(3)} V`;

  return (
    <GlassCard className="h-full justify-between">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-sm">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-slate-800">Threshold Config</h3>
            <p className="text-[12px] font-medium text-slate-400">Gas level safety envelope</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${isSafe ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          {status}
        </span>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Threshold
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
            {thresholdDisplay}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">
            Alert trigger level
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isSafe ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isSafe ? 'text-blue-600' : 'text-red-600'}`}>
            Current Reading
          </span>
          <span className={`text-2xl sm:text-3xl font-black font-mono ${isSafe ? 'text-blue-700' : 'text-red-700'}`}>
            {currentDisplay}
          </span>
          <span className={`text-[11px] font-semibold block mt-1 ${isSafe ? 'text-emerald-600' : 'text-red-600 font-bold'}`}>
            {headroomText}
          </span>
        </div>
      </div>

      {/* Visual Threshold Bar */}
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-500">Voltage Meter</span>
          <span className={`font-bold font-mono ${isSafe ? 'text-blue-600' : 'text-red-600'}`}>{percentage}% of Threshold</span>
        </div>

        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div 
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full transition-all duration-500 ease-out ${isSafe ? 'bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-red-500'}`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium pt-1">
          <span>0.000 V (Zero)</span>
          <span className="text-amber-600 font-bold">Limit: {thresholdDisplay}</span>
          <span>1.000 V (Max)</span>
        </div>
      </div>
    </GlassCard>
  );
});
ThresholdCard.displayName = 'ThresholdCard';

// 3. SENSOR READING GRAPH
export const SensorReadingGraph = React.memo(({ 
  data = [], 
  threshold = 0.400,
  loading = false,
  error = null
}) => {
  const thresholdVal = typeof threshold === 'number' ? threshold : parseFloat(threshold) || 0.400;
  const hasData = Array.isArray(data) && data.length > 0;

  const formatTickTime = (val) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <GlassCard className="min-h-[360px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-slate-800">Sensor Reading</h3>
            <p className="text-[12px] font-medium text-slate-400">
              Live gas sensor voltage (V) over time with threshold boundary
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Voltage (V)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
            <span className="w-3 h-0.5 bg-red-500 border-t border-dashed" />
            <span>Threshold ({thresholdVal.toFixed(3)} V)</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-[260px] flex items-center justify-center">
        {loading ? (
          <div className="text-slate-400 text-sm font-medium animate-pulse">
            Loading historical sensor data...
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm font-medium">
            {error}
          </div>
        ) : !hasData ? (
          <div className="text-slate-400 text-sm font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl w-full h-full flex items-center justify-center">
            No sensor readings available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="timeValue" 
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatTickTime}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
              />
              <YAxis 
                domain={[0, 1.0]} 
                ticks={[0.0, 0.2, 0.4, 0.6, 0.8, 1.0]} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `${Number(v).toFixed(1)}V`}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DCEEFF',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  padding: '8px 12px'
                }}
                labelFormatter={(val) => `Time: ${formatTickTime(val)}`}
                formatter={(value) => [`${Number(value).toFixed(3)} V`, 'Voltage']}
                labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '2px', fontSize: '12px' }}
              />
              <ReferenceLine 
                y={thresholdVal} 
                stroke="#EF4444" 
                strokeDasharray="4 4" 
                strokeWidth={2}
                label={{
                  value: `Threshold: ${thresholdVal.toFixed(3)} V`,
                  position: 'insideTopRight',
                  fill: '#DC2626',
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 10
                }} 
              />
              <Area 
                isAnimationActive={false}
                type="monotone" 
                dataKey="voltage" 
                stroke="#2563EB" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#voltageGradient)" 
                activeDot={{ r: 5, fill: '#1D4ED8', stroke: '#EFF6FF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
});
SensorReadingGraph.displayName = 'SensorReadingGraph';

// 4. SENSOR STATUS CARD
export const SensorStatusCard = React.memo(({ 
  device = "ESP32-CAM-001", 
  status = "ONLINE", 
  reading = "0.000 V",
  lastUpdated = null
}) => {
  const isOnline = status?.toLowerCase() === 'online';
  const displayReading = typeof reading === 'number' ? `${reading.toFixed(3)} V` : reading;

  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : 'Backend Synced';

  return (
    <GlassCard className="h-full justify-between">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-slate-800">{device}</h3>
            <p className="text-[12px] font-medium text-slate-400">Microcontroller & ADC Node</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {status}
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-500" /> Sensor Type
          </span>
          <span className="text-xs font-bold text-slate-800">MQ Gas Sensor</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" /> ADC Module
          </span>
          <span className="text-xs font-bold text-slate-800">ADS1115 (16-Bit)</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Last Reading
          </span>
          <span className="text-xs font-black text-blue-600 font-mono">{displayReading}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Wifi className={`w-3 h-3 ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`} /> {isOnline ? 'Signal: Connected' : 'Disconnected'}
        </span>
        <span>Last Sync: {formattedLastUpdated}</span>
      </div>
    </GlassCard>
  );
});
SensorStatusCard.displayName = 'SensorStatusCard';

// 5. POLLUTION ALERTS PREVIEW
export const PollutionAlertPreview = React.memo(({ latestAlert = null }) => {
  const hasActiveAlert = Boolean(latestAlert && latestAlert.status === 'Active');

  const readingVal = latestAlert?.metadata?.voltage !== undefined 
    ? `${Number(latestAlert.metadata.voltage).toFixed(3)} V` 
    : (latestAlert?.voltage !== undefined ? `${Number(latestAlert.voltage).toFixed(3)} V` : '--');

  const thresholdVal = latestAlert?.metadata?.threshold !== undefined 
    ? `${Number(latestAlert.metadata.threshold).toFixed(3)} V` 
    : (latestAlert?.threshold !== undefined ? (typeof latestAlert.threshold === 'string' && latestAlert.threshold.includes('V') ? latestAlert.threshold : `${Number(latestAlert.threshold).toFixed(3)} V`) : '0.400 V');

  const deviceVal = latestAlert?.deviceId || latestAlert?.sensorId || 'ESP32-CAM-001';
  const timeVal = latestAlert?.timestamp 
    ? new Date(latestAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) 
    : (latestAlert?.createdAt ? new Date(latestAlert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '--');

  return (
    <GlassCard className="h-full justify-between">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${hasActiveAlert ? 'bg-red-50 border border-red-200/80 text-red-600' : 'bg-emerald-50 border border-emerald-200/80 text-emerald-600'} flex items-center justify-center shadow-sm`}>
            {hasActiveAlert ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-slate-800">Pollution Alerts</h3>
            <p className="text-[12px] font-medium text-slate-400">Threshold breach surveillance</p>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${hasActiveAlert ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {hasActiveAlert ? 'Active Alert' : 'Normal / Safe'}
        </span>
      </div>

      {/* Alert Content Card */}
      {hasActiveAlert ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚨</span>
              <span className="font-extrabold text-sm text-red-700 tracking-tight">
                Threshold Exceeded
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
              ALERT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono bg-white p-3 rounded-xl border border-red-200/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reading</span>
              <span className="text-sm font-black text-red-600">{readingVal}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Threshold</span>
              <span className="text-sm font-bold text-slate-700">{thresholdVal}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Device</span>
              <span className="text-xs font-bold text-slate-800 truncate">{deviceVal}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
              <span className="text-xs font-bold text-slate-800">{timeVal}</span>
            </div>
          </div>

          <p className="text-[11px] text-red-700/90 font-medium leading-relaxed">
            {latestAlert.message || `Gas sensor voltage reached threshold (${thresholdVal}). Real-time alert active.`}
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Active Alerts</h4>
          <p className="text-[12px] text-slate-500 mt-1 max-w-xs">
            All live gas sensor voltage levels are operating within safe parameters (&lt; {thresholdVal}).
          </p>
        </div>
      )}

      <div className="pt-3 mt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
        {hasActiveAlert ? `Breach registered at ${timeVal}` : 'System status: Normal operating safety'}
      </div>
    </GlassCard>
  );
});
PollutionAlertPreview.displayName = 'PollutionAlertPreview';

// 6. EVIDENCE PREVIEW
export const EvidencePreview = React.memo(({ latestEvidence = null }) => {
  const hasRealEvidence = Boolean(latestEvidence && latestEvidence.imageUrl);
  const imageUrl = hasRealEvidence ? getEvidenceImageUrl(latestEvidence.imageUrl) : '';
  const evidenceId = latestEvidence?.evidenceId || 'Standby';
  const voltageVal = latestEvidence?.voltage !== undefined 
    ? `${Number(latestEvidence.voltage).toFixed(3)} V` 
    : (latestEvidence?.metadata?.voltage !== undefined ? `${Number(latestEvidence.metadata.voltage).toFixed(3)} V` : '--');
  
  const timeVal = latestEvidence?.createdAt 
    ? new Date(latestEvidence.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) 
    : (latestEvidence?.timestamp ? new Date(latestEvidence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'Standby');

  return (
    <GlassCard className="h-full justify-between">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-slate-800">Latest Evidence</h3>
            <p className="text-[12px] font-medium text-slate-400">ESP32-CAM visual capture frame</p>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
          hasRealEvidence 
            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
            : 'bg-slate-100 text-slate-400'
        }`}>
          {hasRealEvidence ? 'Live Capture' : 'Camera Standby'}
        </span>
      </div>

      {/* Camera Viewfinder Box */}
      <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 flex flex-col items-center justify-center text-center overflow-hidden group">
        
        {hasRealEvidence ? (
          <img 
            src={imageUrl} 
            alt="ESP32-CAM Live Evidence" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          /* Center Crosshair & Icon when no image uploaded */
          <div className="relative z-10 flex flex-col items-center p-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Camera Image Placeholder
            </span>
            <span className="text-[10px] font-mono text-purple-300/80 mt-0.5">
              ESP32-CAM (Standby)
            </span>
          </div>
        )}

        {/* Viewfinder corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-purple-400/80 pointer-events-none z-10" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400/80 pointer-events-none z-10" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400/80 pointer-events-none z-10" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-400/80 pointer-events-none z-10" />

        {/* Timestamp & Trigger watermark overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 flex justify-between items-center text-[10px] font-mono text-slate-200 pointer-events-none z-10">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hasRealEvidence ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
            {hasRealEvidence ? 'REC: CAPTURED' : 'REC: AUTO'}
          </span>
          <span>{hasRealEvidence ? timeVal : '1600x1200 UXGA'}</span>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Event:</span>
          <span className="font-mono font-bold text-slate-800 truncate ml-1">{evidenceId}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Reading:</span>
          <span className="font-mono font-bold text-red-600">{voltageVal}</span>
        </div>
      </div>
    </GlassCard>
  );
});
EvidencePreview.displayName = 'EvidencePreview';

