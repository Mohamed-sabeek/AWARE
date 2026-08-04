import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  Search, Calendar, Filter, ChevronDown, Download, Activity, AlertTriangle, 
  Camera, Cloud, FileText, Mail, ShieldAlert, Satellite, MapPin, 
  ShieldCheck, Settings, X, ExternalLink, Database, Cpu, Eye, Clock, CheckCircle2,
  Info
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';
const CountUp = ({ value, decimals = 0, duration = 2, delay = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(count, value, { duration, delay, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
};

// LocalGlassCard removed since we use PremiumSummaryCard

const MOCK_ACTIVITIES = [];

const getColorConfig = (color) => {
  const configs = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-200' },
    red: { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  };
  return configs[color] || configs.blue;
};

const ActivityLogs = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader 
        title="Activity Logs"
        description="Track every action performed by the AWARE environmental monitoring platform in chronological order."
      />
      
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumSummaryCard 
            title="Total Activities" 
            value={0} 
            total={100} 
            trendVal="0"
            trendDir="none"
            trendPeriod="today"
            statusText="Live Sync"
            icon={Activity} 
            themeColor="#3b82f6" 
            gradientBg="from-blue-50/40 to-transparent"
            delay={0.1}
            percentageOverride={0}
          />
          <PremiumSummaryCard 
            title="Today's Activities" 
            value={0} 
            total={0} 
            trendVal="0"
            trendDir="none"
            trendPeriod="today"
            statusText="Today"
            icon={Clock} 
            themeColor="#0ea5e9" 
            gradientBg="from-sky-50/40 to-transparent"
            delay={0.2}
          />
          <PremiumSummaryCard 
            title="Critical Events" 
            value={0} 
            total={0} 
            trendVal="0"
            trendDir="none"
            trendPeriod="today"
            statusText="High Priority"
            icon={AlertTriangle} 
            themeColor="#ef4444" 
            gradientBg="from-red-50/40 to-transparent"
            delay={0.3}
          />
          <PremiumSummaryCard 
            title="Notifications Sent" 
            value={0} 
            total={0} 
            trendVal="0"
            trendDir="none"
            trendPeriod="today"
            statusText="Delivered"
            icon={Mail} 
            themeColor="#22c55e" 
            gradientBg="from-green-50/40 to-transparent"
            delay={0.4}
          />
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2F0FF] p-4 flex flex-wrap lg:flex-nowrap gap-4 items-center relative z-20">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search activities..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              Today
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
              <Filter className="w-4 h-4" />
              All Activities
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
              <ShieldAlert className="w-4 h-4" />
              All Severities
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-[#E2F0FF] hidden lg:block mx-2" />
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-[13px] font-bold hover:bg-[#2563EB] transition-colors shadow-sm shrink-0 whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2F0FF] p-8 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8FBFF] to-white opacity-50 z-0" />
          <div className="relative z-10 max-w-5xl mx-auto">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-[20px] font-bold text-[#0F172A]">Activity Timeline</h2>
              <div className="text-[13px] font-semibold text-[#64748B]">Showing {MOCK_ACTIVITIES.length} of {MOCK_ACTIVITIES.length}</div>
            </div>

            {MOCK_ACTIVITIES.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Activity className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Activity Yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm">When the system generates logs and alerts, they will appear chronologically here.</p>
              </div>
            ) : (
              <div className="relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#DCEEFF] before:to-transparent">
                {MOCK_ACTIVITIES.map((activity, i) => {
                  const colors = getColorConfig(activity.color);
                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-8 first:mt-0"
                    >
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-white ${colors.bg} ${colors.text} shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 z-10 -translate-x-[15px]`}>
                        <activity.icon className="w-7 h-7" />
                      </div>

                      {/* Card */}
                      <div className="w-[calc(100%-5rem)] md:w-[calc(50%-4rem)] p-5 rounded-2xl bg-white border border-[#E2F0FF] shadow-sm hover:shadow-md transition-shadow cursor-pointer ml-auto md:ml-0"
                           onClick={() => setSelectedActivity(activity)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[11px] font-bold uppercase tracking-widest ${colors.text} bg-white border ${colors.border} px-2.5 py-1 rounded-full`}>
                            {activity.severity}
                          </span>
                          <span className="text-[12px] font-semibold text-[#94A3B8] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {activity.time}
                          </span>
                        </div>
                        
                        <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">{activity.title}</h3>
                        <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">{activity.desc}</p>
                        
                        {activity.details.aqi && (
                          <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex gap-4">
                            <div>
                              <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-0.5">AQI</p>
                              <p className="text-[15px] font-bold text-[#0F172A]">{activity.details.aqi}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-0.5">Confidence</p>
                              <p className="text-[15px] font-bold text-[#3B82F6]">{activity.details.confidence}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-0.5">Location</p>
                              <p className="text-[13px] font-semibold text-[#64748B] mt-0.5 truncate max-w-[120px]">{activity.details.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {MOCK_ACTIVITIES.length > 0 && (
              <div className="mt-16 flex items-center justify-between border-t border-[#E2F0FF] pt-8">
                <button className="px-5 py-2.5 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#3B82F6] transition-colors shadow-sm">
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, '...', 623].map((page, index) => (
                    <button 
                      key={index}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold transition-colors ${
                        page === 1 
                          ? 'bg-[#3B82F6] text-white shadow-sm' 
                          : 'bg-white border border-[#DCEEFF] text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#3B82F6]'
                      } ${page === '...' ? 'border-none bg-transparent hover:bg-transparent cursor-default' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="px-5 py-2.5 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#3B82F6] transition-colors shadow-sm">
                  Next
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* SIDE DRAWER FOR DETAILS */}
      <AnimatePresence>
        {selectedActivity && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] border-l border-[#E2F0FF] flex flex-col"
            >
              <div className="p-6 border-b border-[#E2F0FF] flex justify-between items-center bg-[#F8FBFF]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getColorConfig(selectedActivity.color).bg} ${getColorConfig(selectedActivity.color).text} flex items-center justify-center border border-white shadow-sm`}>
                    <selectedActivity.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0F172A]">Activity Details</h2>
                    <p className="text-[12px] font-medium text-[#64748B]">{selectedActivity.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#DCEEFF] flex items-center justify-center text-[#94A3B8] hover:text-[#3B82F6] hover:border-[#3B82F6] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">{selectedActivity.title}</h3>
                  <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">{selectedActivity.desc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FBFF] border border-[#E2F0FF] rounded-xl p-4">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{selectedActivity.date} at {selectedActivity.time}</p>
                  </div>
                  <div className="bg-[#F8FBFF] border border-[#E2F0FF] rounded-xl p-4">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Type</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{selectedActivity.type}</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E2F0FF] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#E2F0FF] bg-[#F8FBFF]">
                    <h4 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#3B82F6]" /> Metadata
                    </h4>
                  </div>
                  <div className="p-5 space-y-4">
                    {Object.entries(selectedActivity.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                        <span className="text-[13px] font-semibold text-[#64748B] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-[13px] font-bold ${value === 'Critical' ? 'text-red-500' : 'text-[#0F172A]'}`}>
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value.toString().startsWith('http') ? <a href={value} className="text-[#3B82F6] hover:underline flex items-center gap-1">View Link <ExternalLink className="w-3 h-3"/></a> : value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedActivity.color === 'red' && (
                  <button className="w-full py-3 bg-red-50 text-red-600 font-bold text-[14px] rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                    View Incident Report
                  </button>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ActivityLogs;
