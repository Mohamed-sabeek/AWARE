import React from 'react';
import { Server, Wifi, Clock } from 'lucide-react';

const DeviceHealth = ({ data }) => {
  const empty = !data || data.length === 0;

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Server className="w-4 h-4 text-slate-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">Device Health</h3>
      </div>

      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF] text-center p-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <Wifi className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-sm font-bold text-slate-600 mb-1">Device Offline</span>
          <span className="text-xs font-medium text-slate-400">Waiting for ESP32 connection...</span>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {data.map((device) => {
            const isOnline = device.status === 'Online';
            
            return (
              <div key={device.sensorId} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                      <Server className={`w-5 h-5 ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`} />
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{device.sensorId}</h4>
                    <span className={`text-[11px] font-bold ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {device.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end text-slate-400 mb-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Last Sync</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {new Date(device.lastUpdated).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeviceHealth;
