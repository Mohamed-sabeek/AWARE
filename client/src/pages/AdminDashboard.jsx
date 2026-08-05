import React, { useState, useEffect } from 'react';
import { Globe, Radio, AlertTriangle, Camera as CameraIcon, Mail, Activity, WifiOff } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';
import { LatestSensorWidget, LatestAlertWidget, LatestEvidenceWidget, DeviceOverviewWidget } from '../components/dashboard/DashboardWidgets';

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="min-h-[190px] bg-white/40 backdrop-blur-md rounded-[24px] border border-[#E2F0FF] p-6 animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-[18px] bg-slate-200" />
          <div className="w-16 h-6 rounded-full bg-slate-200" />
        </div>
        <div className="w-32 h-4 bg-slate-200 rounded mb-2" />
        <div className="w-16 h-10 bg-slate-200 rounded mb-6" />
        <div className="w-full h-1.5 bg-slate-200 rounded-full" />
      </div>
    ))}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchDashboardStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader 
        title="Dashboard"
        description="Monitor your environmental monitoring platform in real time."
      />
      
      {error && (
        <div className="mx-6 md:mx-8 lg:mx-10 mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3 text-sm font-semibold shadow-sm">
          <WifiOff className="w-5 h-5" />
          Failed to sync live data. Retrying in background...
        </div>
      )}

      <div className="p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto pb-24">
        <div className="space-y-8">
          
          {loading && !stats ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PremiumSummaryCard 
                  title="Average AQI" 
                  value={stats?.averageAQI === null ? '--' : stats?.averageAQI} 
                  total={500} 
                  trendVal={stats?.averageAQI === null ? '0' : 'Live'}
                  trendDir="none"
                  trendPeriod="today"
                  statusText={stats?.averageAQI === null ? 'Waiting' : 'Live Sync'}
                  icon={Globe} 
                  themeColor="#8b5cf6" 
                  gradientBg="from-purple-50/40 to-transparent"
                  delay={0.1}
                  percentageOverride={stats?.averageAQI === null ? 0 : (stats.averageAQI / 500) * 100}
                />
                <PremiumSummaryCard 
                  title="Online Sensors" 
                  value={stats?.onlineDevices || 0} 
                  total={stats?.totalDevices || 0} 
                  trendVal={`${stats?.offlineDevices || 0} offline`}
                  trendDir={stats?.offlineDevices > 0 ? 'down' : 'up'}
                  trendPeriod=""
                  statusText={stats?.totalDevices === 0 ? 'Waiting' : 'Connected'}
                  icon={Radio} 
                  themeColor="#10b981" 
                  gradientBg="from-emerald-50/40 to-transparent"
                  delay={0.15}
                />
                <PremiumSummaryCard 
                  title="Active Alerts" 
                  value={stats?.activeAlerts || 0} 
                  total={stats?.activeAlerts || 0} // just for UI progress
                  trendVal={stats?.activeAlerts > 0 ? 'Action needed' : 'All clear'}
                  trendDir={stats?.activeAlerts > 0 ? 'down' : 'up'}
                  trendPeriod=""
                  statusText={stats?.activeAlerts > 0 ? 'High Priority' : 'Safe'}
                  icon={AlertTriangle} 
                  themeColor="#ef4444" 
                  gradientBg="from-red-50/40 to-transparent"
                  delay={0.2}
                  percentageOverride={stats?.activeAlerts > 0 ? 100 : 0}
                />
                
                <PremiumSummaryCard 
                  title="Evidence Captured" 
                  value={stats?.evidenceCount || 0} 
                  total={stats?.evidenceCount || 0} 
                  trendVal="Today"
                  trendDir="up"
                  trendPeriod=""
                  statusText="Synced"
                  icon={CameraIcon} 
                  themeColor="#0ea5e9" 
                  gradientBg="from-sky-50/40 to-transparent"
                  delay={0.25}
                  percentageOverride={stats?.evidenceCount > 0 ? 100 : 0}
                />
                <PremiumSummaryCard 
                  title="Emails Sent" 
                  value={0} // Notifications are not fully implemented yet, but keeping this as 0 count is safe
                  total={0} 
                  trendVal="0"
                  trendDir="none"
                  trendPeriod="today"
                  statusText="Delivered"
                  icon={Mail} 
                  themeColor="#f59e0b" 
                  gradientBg="from-amber-50/40 to-transparent"
                  delay={0.3}
                />
                <PremiumSummaryCard 
                  title="System Health" 
                  value={stats?.systemHealthPercentage || 100} 
                  decimals={0}
                  total={100} 
                  trendVal="Live"
                  trendDir={stats?.systemHealth === 'Healthy' ? 'up' : 'down'}
                  trendPeriod=""
                  statusText={stats?.systemHealth || 'Unknown'}
                  icon={Activity} 
                  themeColor={stats?.systemHealth === 'Healthy' ? '#3b82f6' : stats?.systemHealth === 'Warning' ? '#f59e0b' : '#ef4444'} 
                  gradientBg="from-blue-50/40 to-transparent"
                  delay={0.35}
                  percentageOverride={stats?.systemHealthPercentage || 100}
                />
              </div>

              {/* Detailed Overview Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="lg:col-span-1">
                  <LatestSensorWidget data={stats?.latestReading} />
                </div>
                <div className="lg:col-span-1">
                  <LatestAlertWidget data={stats?.latestAlert} />
                </div>
                <div className="lg:col-span-1">
                  <LatestEvidenceWidget data={stats?.latestEvidence} />
                </div>
                <div className="lg:col-span-1">
                  <DeviceOverviewWidget stats={stats} />
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
