import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

const EnvironmentalInsights = ({ insights }) => {
  const empty = !insights || insights.length === 0;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[24px] p-6 shadow-lg text-white relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30 backdrop-blur-sm">
          <Lightbulb className="w-5 h-5 text-indigo-300" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-white">Environmental Insights</h3>
          <p className="text-indigo-200/70 text-[12px] font-medium">Dynamically generated from sensor data</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Sparkles className="w-8 h-8 text-indigo-400/50 mb-3" />
            <span className="text-sm font-medium text-indigo-200/70 max-w-[250px]">
              Environmental insights will be generated automatically after sufficient sensor data has been collected.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <p className="text-sm font-medium text-indigo-50 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalInsights;
