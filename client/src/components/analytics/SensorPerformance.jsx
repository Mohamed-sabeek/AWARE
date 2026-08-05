import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const MetricCard = ({ title, data, unit, color }) => {
  const empty = !data || (data.latest === null && data.avg === null && data.max === null && data.min === null);

  const colors = {
    red: 'text-red-600 bg-red-50 border-red-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    pink: 'text-pink-600 bg-pink-50 border-pink-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color].split(' ')[1]} ${colors[color].split(' ')[0]}`}>
            <Cpu className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-700">{title}</h4>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          empty ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-700'
        }`}>
          {empty ? 'Waiting' : 'Healthy'}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-black text-slate-800 leading-none">
          {empty ? '--' : data.latest}
        </span>
        <span className="text-sm font-bold text-slate-400 mb-1">{unit}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg</div>
          <div className="text-sm font-semibold text-slate-700">{empty ? '--' : data.avg}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max</div>
          <div className="text-sm font-semibold text-slate-700">{empty ? '--' : data.max}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min</div>
          <div className="text-sm font-semibold text-slate-700">{empty ? '--' : data.min}</div>
        </div>
      </div>
    </div>
  );
};

const SensorPerformance = ({ sensors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard title="PM2.5 Sensor" data={sensors?.pm25} unit="µg/m³" color="red" />
      <MetricCard title="PM10 Sensor" data={sensors?.pm10} unit="µg/m³" color="orange" />
      <MetricCard title="MQ135 Gas" data={sensors?.mq135} unit="PPM" color="purple" />
      <MetricCard title="Temperature" data={sensors?.temperature} unit="°C" color="pink" />
      <MetricCard title="Humidity" data={sensors?.humidity} unit="%" color="emerald" />
    </div>
  );
};

export default SensorPerformance;
