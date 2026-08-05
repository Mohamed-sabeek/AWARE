import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const PollutionTrendChart = ({ data, activeMetric }) => {
  const empty = !data || data.length === 0;

  const colors = {
    aqi: '#3b82f6',
    pm25: '#ef4444',
    pm10: '#f59e0b',
    mq135: '#8b5cf6',
    temperature: '#ec4899',
    humidity: '#10b981'
  };

  return (
    <div className="bg-white border border-[#E2F0FF] rounded-[24px] p-6 shadow-sm w-full h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">Pollution Trends</h3>
      </div>

      <div className="flex-1 relative w-full h-full">
        {empty ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-[#DCEEFF]">
            <span className="text-sm font-medium text-slate-400">No historical sensor data available</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2F0FF" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10} 
                tickFormatter={(tick) => {
                  const d = new Date(tick);
                  return d.toLocaleTimeString('en-US', { hour: 'numeric' });
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dx={-10} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                labelFormatter={(label) => new Date(label).toLocaleString('en-IN')}
              />
              <Line 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={colors[activeMetric] || colors.aqi} 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: colors[activeMetric] || colors.aqi }} 
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PollutionTrendChart;
