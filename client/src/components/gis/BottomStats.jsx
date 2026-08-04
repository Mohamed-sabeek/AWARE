import React from 'react';

const BottomStats = ({ sensors }) => {
  const online = sensors.filter(s => s.status === 'Online').length;
  const offline = sensors.filter(s => s.status !== 'Online').length;
  const smokeAlerts = sensors.filter(s => s.detectionType === 'Smoke' || s.detectionType === 'Fire').length;
  const avgAqi = sensors.length > 0 ? Math.round(sensors.reduce((acc, s) => acc + s.aqi, 0) / sensors.length) : 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6 px-4 py-3 bg-white border border-[#E2F0FF] rounded-2xl shadow-sm text-sm font-semibold text-slate-600">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
        Online: <span className="text-slate-800">{online}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
        Offline: <span className="text-slate-800">{offline}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        Smoke/Fire: <span className="text-red-600 font-bold">{smokeAlerts}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
        Avg AQI: <span className="text-slate-800">{avgAqi}</span>
      </div>
    </div>
  );
};

export default BottomStats;
