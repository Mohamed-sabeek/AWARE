import React from 'react';
import { Radio, AlertTriangle, Camera, MapPin, Activity, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-[#DCEEFF] p-6 shadow-[0_8px_30px_rgba(96,165,250,0.04)] relative overflow-hidden flex flex-col h-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-0" />
    <div className="relative z-10 flex-1 flex flex-col">{children}</div>
  </motion.div>
);

export const LatestSensorWidget = ({ data }) => {
  const empty = !data;
  return (
    <GlassCard delay={0.4}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-slate-800">Latest Sensor Reading</h3>
          <p className="text-[12px] font-medium text-slate-400">
            {empty ? 'Waiting for ESP32 data...' : `Sensor: ${data.sensorId}`}
          </p>
        </div>
      </div>
      
      {empty ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF] text-sm font-medium text-slate-400 min-h-[150px]">
          Waiting for ESP32 data...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AQI</span>
            <span className={`text-2xl font-black ${data.aqi > 100 ? 'text-red-500' : 'text-slate-800'}`}>{data.aqi}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">PM2.5</span>
            <span className="text-2xl font-black text-slate-800">{data.pm25}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Temp</span>
              <span className="text-lg font-bold text-slate-700">{data.temperature}°C</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Hum</span>
              <span className="text-lg font-bold text-slate-700">{data.humidity}%</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export const LatestAlertWidget = ({ data }) => {
  const empty = !data;
  return (
    <GlassCard delay={0.5}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-slate-800">Latest Active Alert</h3>
          <p className="text-[12px] font-medium text-slate-400">
            {empty ? 'No active alerts' : new Date(data.timestamp).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {empty ? (
        <div className="flex-1 flex items-center justify-center bg-green-50/50 rounded-xl border border-dashed border-green-100 text-sm font-medium text-green-500 min-h-[150px]">
          No active alerts
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center bg-red-50/30 p-5 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-wider">{data.severity}</span>
            <span className="font-bold text-red-600 text-sm">{data.type}</span>
          </div>
          <p className="text-slate-700 font-medium text-sm leading-relaxed mb-3">
            {data.message}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-auto">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            Sensor ID: {data.sensorId}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export const LatestEvidenceWidget = ({ data }) => {
  const empty = !data;
  return (
    <GlassCard delay={0.6}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
          <Camera className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-slate-800">Latest Evidence</h3>
          <p className="text-[12px] font-medium text-slate-400">
            {empty ? 'No evidence captured' : new Date(data.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {empty ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF] text-sm font-medium text-slate-400 min-h-[150px]">
          No evidence captured yet
        </div>
      ) : (
        <div className="flex-1 flex gap-4">
          <div className="w-1/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            {data.cloudinaryUrl ? (
              <img src={data.cloudinaryUrl} alt="Evidence" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400"><Camera className="w-8 h-8 opacity-50" /></div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">{data.detectionType} Detected</span>
            <h4 className="font-bold text-slate-800 text-sm mb-2">{data.location}</h4>
            <div className="flex items-center gap-2 mt-auto">
               <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  data.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
               }`}>{data.status}</span>
               <span className="text-xs font-bold text-slate-500">AQI: {data.aqi}</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export const DeviceOverviewWidget = ({ stats }) => {
  return (
    <GlassCard delay={0.7}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <Cpu className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-[16px] font-bold text-slate-800">Device Overview</h3>
          <p className="text-[12px] font-medium text-slate-400 flex justify-between w-full">
            <span>{stats?.totalDevices || 0} Total Nodes</span>
            {stats?.lastUpdated && <span>Last sync: {new Date(stats.lastUpdated).toLocaleTimeString('en-IN')}</span>}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Online</span>
            <span className="text-lg font-black text-slate-800">{stats?.onlineDevices || 0}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.totalDevices ? (stats.onlineDevices / stats.totalDevices) * 100 : 0}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Offline</span>
            <span className="text-lg font-black text-slate-800">{stats?.offlineDevices || 0}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${stats?.totalDevices ? (stats.offlineDevices / stats.totalDevices) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
