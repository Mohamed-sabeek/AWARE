import React from 'react';
import { Globe, Radio, AlertTriangle, Camera as CameraIcon, Mail, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';

const AdminDashboard = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader 
        title="Dashboard"
        description="Monitor your environmental monitoring platform in real time."
      />
      <div className="p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PremiumSummaryCard 
              title="Live AQI" 
              value={0} 
              total={500} 
              trendVal="0"
              trendDir="none"
              trendPeriod="today"
              statusText="Live Sync"
              icon={Globe} 
              themeColor="#8b5cf6" 
              gradientBg="from-purple-50/40 to-transparent"
              delay={0.1}
            />
            <PremiumSummaryCard 
              title="Active Sensors" 
              value={0} 
              total={0} 
              trendVal="0"
              trendDir="none"
              trendPeriod="today"
              statusText="Online"
              icon={Radio} 
              themeColor="#10b981" 
              gradientBg="from-emerald-50/40 to-transparent"
              delay={0.15}
            />
            <PremiumSummaryCard 
              title="Active Alerts" 
              value={0} 
              total={0} 
              trendVal="0"
              trendDir="none"
              trendPeriod="today"
              statusText="High Priority"
              icon={AlertTriangle} 
              themeColor="#ef4444" 
              gradientBg="from-red-50/40 to-transparent"
              delay={0.2}
            />
            
            <PremiumSummaryCard 
              title="Evidence Captured" 
              value={0} 
              total={0} 
              trendVal="0"
              trendDir="none"
              trendPeriod="today"
              statusText="Today"
              icon={CameraIcon} 
              themeColor="#0ea5e9" 
              gradientBg="from-sky-50/40 to-transparent"
              delay={0.25}
            />
            <PremiumSummaryCard 
              title="Emails Sent" 
              value={0} 
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
              value={99.98} 
              decimals={2}
              total={100} 
              trendVal="0"
              trendDir="none"
              trendPeriod="today"
              statusText="Operational"
              icon={Activity} 
              themeColor="#3b82f6" 
              gradientBg="from-blue-50/40 to-transparent"
              delay={0.35}
              percentageOverride={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
