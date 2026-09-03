import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  Search, Calendar, Filter, ChevronDown, Download, Activity, AlertTriangle, 
  Camera, Cloud, FileText, Mail, ShieldAlert, Satellite, MapPin, 
  ShieldCheck, Settings, X, ExternalLink, Database, Cpu, Eye, Clock, CheckCircle2,
  Info, Server, Power, Loader2, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';

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

const getIconForCategory = (category) => {
  switch (category) {
    case 'Hardware': return Cpu;
    case 'Sensor': return Activity;
    case 'Alert': return AlertTriangle;
    case 'System': return Server;
    case 'Evidence': return Camera;
    default: return Info;
  }
};

const getColorForSeverity = (severity) => {
  switch (severity) {
    case 'Info': return 'blue';
    case 'Success': return 'green';
    case 'Warning': return 'orange';
    case 'Critical': return 'red';
    default: return 'blue';
  }
};

const ActivityLogSkeleton = () => (
  <div className="space-y-8 animate-pulse p-8 bg-white rounded-3xl border border-[#E2F0FF]">
    <div className="flex justify-between items-center mb-10">
      <div className="w-48 h-8 bg-slate-200 rounded"></div>
      <div className="w-24 h-4 bg-slate-200 rounded"></div>
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-8`}>
        <div className={`w-16 h-16 rounded-full bg-slate-200 shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 z-10 -translate-x-[15px]`}></div>
        <div className="w-[calc(100%-5rem)] md:w-[calc(50%-4rem)] p-5 rounded-2xl bg-white border border-[#E2F0FF] shadow-sm ml-auto md:ml-0 h-32 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            <div className="w-20 h-4 bg-slate-200 rounded"></div>
          </div>
          <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
          <div className="w-full h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Activities');
  const [severity, setSeverity] = useState('All Severities');

  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/activity-logs', {
          params: { page, limit: 20, search, category, severity }
        }),
        api.get('/activity-logs/statistics')
      ]);
      setLogs(logsRes.data.logs);
      setTotalLogs(logsRes.data.total);
      setPages(logsRes.data.pages);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [page, search, category, severity]);

  const handleFilterChange = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader 
        title="Activity Logs"
        description="Track every action performed by the AWARE environmental monitoring platform in chronological order."
      />
      
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans pb-24">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumSummaryCard 
            title="Total Activities" 
            value={stats?.totalActivities || 0} 
            total={stats?.totalActivities || 0} 
            trendVal="Live"
            trendDir="up"
            trendPeriod="all time"
            statusText="Live Sync"
            icon={Activity} 
            themeColor="#3b82f6" 
            gradientBg="from-blue-50/40 to-transparent"
            delay={0.1}
            percentageOverride={100}
          />
          <PremiumSummaryCard 
            title="Today's Activities" 
            value={stats?.todaysActivities || 0} 
            total={stats?.totalActivities || 1} 
            trendVal="Active"
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
            value={stats?.criticalEvents || 0} 
            total={stats?.todaysActivities || 1} 
            trendVal={stats?.criticalEvents > 0 ? 'Warning' : 'Clear'}
            trendDir={stats?.criticalEvents > 0 ? 'down' : 'up'}
            trendPeriod="today"
            statusText="High Priority"
            icon={AlertTriangle} 
            themeColor="#ef4444" 
            gradientBg="from-red-50/40 to-transparent"
            delay={0.3}
            percentageOverride={stats?.criticalEvents > 0 ? 100 : 0}
          />
          <PremiumSummaryCard 
            title="Alerts Dispatched" 
            value={stats?.notificationsSent || 0} 
            total={stats?.todaysActivities || 1} 
            trendVal="System"
            trendDir="up"
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
              placeholder="Search by device name, ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
              className="w-full pl-12 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            <select 
              value={category}
              onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
              className="px-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors focus:outline-none cursor-pointer appearance-none pr-10 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option>All Activities</option>
              <option>Hardware</option>
              <option>Sensor</option>
              <option>Alert</option>
              <option>System</option>
              <option>Evidence</option>
            </select>
            
            <select 
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); handleFilterChange(); }}
              className="px-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors focus:outline-none cursor-pointer appearance-none pr-10 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option>All Severities</option>
              <option>Info</option>
              <option>Success</option>
              <option>Warning</option>
              <option>Critical</option>
            </select>
          </div>
          
          <div className="w-px h-8 bg-[#E2F0FF] hidden lg:block mx-2" />
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-[13px] font-bold hover:bg-[#2563EB] transition-colors shadow-sm shrink-0 whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* TIMELINE */}
        {loading ? (
          <ActivityLogSkeleton />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2F0FF] p-8 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F8FBFF] to-white opacity-50 z-0" />
            <div className="relative z-10 max-w-5xl mx-auto">
              
              <div className="flex flex-wrap justify-between items-center gap-4 mb-10 pb-4 border-b border-[#E2F0FF]">
                <div>
                  <h2 className="text-[20px] font-bold text-[#0F172A]">Activity Timeline</h2>
                  <div className="text-[13px] font-semibold text-[#64748B] mt-0.5">Showing {logs.length} of {totalLogs} events</div>
                </div>

                {/* Top Pagination Controls */}
                {logs.length > 0 && pages > 1 && (
                  <div className="flex items-center gap-2.5">
                    <button 
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#3B82F6] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-[13px] font-bold text-slate-600 px-2">
                      Page {page} of {pages}
                    </span>
                    <button 
                      type="button"
                      disabled={page === pages}
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      className="px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#3B82F6] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Activity className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No system activity recorded yet.</h3>
                  <p className="text-slate-500 mt-1 max-w-sm">When the system generates logs and alerts, they will appear chronologically here.</p>
                </div>
              ) : (
                <div className="relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#DCEEFF] before:to-transparent">
                  {logs.map((activity, i) => {
                    const colors = getColorConfig(getColorForSeverity(activity.severity));
                    const Icon = getIconForCategory(activity.category);
                    return (
                      <motion.div 
                        key={activity._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-8 first:mt-0"
                      >
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-white ${colors.bg} ${colors.text} shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 z-10 -translate-x-[15px]`}>
                          <Icon className="w-7 h-7" />
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
                              {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">{activity.deviceName}</h3>
                          <p className="text-[#64748B] text-[13px] font-medium leading-relaxed">{activity.description}</p>
                          
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex flex-wrap gap-4">
                              {Object.entries(activity.metadata).slice(0, 3).map(([key, val]) => (
                                <div key={key}>
                                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-0.5">{key}</p>
                                  <p className="text-[14px] font-bold text-[#0F172A]">{String(val)}</p>
                                </div>
                              ))}
                              <div>
                                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-0.5">Location</p>
                                <p className="text-[13px] font-semibold text-[#64748B] mt-0.5 truncate max-w-[120px]">{activity.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

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
                  <div className={`w-10 h-10 rounded-xl ${getColorConfig(getColorForSeverity(selectedActivity.severity)).bg} ${getColorConfig(getColorForSeverity(selectedActivity.severity)).text} flex items-center justify-center border border-white shadow-sm`}>
                    {React.createElement(getIconForCategory(selectedActivity.category), { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0F172A]">Activity Details</h2>
                    <p className="text-[12px] font-medium text-[#64748B]">{selectedActivity._id}</p>
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
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">{selectedActivity.deviceName}</h3>
                  <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">{selectedActivity.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FBFF] border border-[#E2F0FF] rounded-xl p-4">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{new Date(selectedActivity.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-[#F8FBFF] border border-[#E2F0FF] rounded-xl p-4">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Category</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{selectedActivity.category}</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E2F0FF] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#E2F0FF] bg-[#F8FBFF]">
                    <h4 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#3B82F6]" /> Metadata
                    </h4>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-3">
                      <span className="text-[13px] font-semibold text-[#64748B]">Location</span>
                      <span className="text-[13px] font-bold text-[#0F172A]">{selectedActivity.location}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-3">
                      <span className="text-[13px] font-semibold text-[#64748B]">Device ID</span>
                      <span className="text-[13px] font-bold text-[#0F172A]">{selectedActivity.deviceId}</span>
                    </div>
                    {selectedActivity.metadata && Object.entries(selectedActivity.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                        <span className="text-[13px] font-semibold text-[#64748B] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-[13px] font-bold ${value === 'Critical' ? 'text-red-500' : 'text-[#0F172A]'}`}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ActivityLogs;
