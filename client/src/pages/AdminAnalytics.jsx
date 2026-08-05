import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import SummaryCards from '../components/analytics/SummaryCards';
import PollutionTrendChart from '../components/analytics/PollutionTrendChart';
import AQIDistribution from '../components/analytics/AQIDistribution';
import SensorPerformance from '../components/analytics/SensorPerformance';
import EvidenceAnalytics from '../components/analytics/EvidenceAnalytics';
import AlertAnalytics from '../components/analytics/AlertAnalytics';
import PeakPollutionHours from '../components/analytics/PeakPollutionHours';
import EnvironmentalInsights from '../components/analytics/EnvironmentalInsights';
import DeviceHealth from '../components/analytics/DeviceHealth';
import { Download, FileText, Calendar } from 'lucide-react';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [sensors, setSensors] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [deviceHealth, setDeviceHealth] = useState([]);
  const [insights, setInsights] = useState([]);
  const [peakHours, setPeakHours] = useState(null);

  // Filters
  const [trendRange, setTrendRange] = useState('24h');
  const [activeMetric, setActiveMetric] = useState('aqi');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        resOverview,
        resTrends,
        resDistribution,
        resSensors,
        resEvidence,
        resAlerts,
        resDevice,
        resInsights,
        resPeak
      ] = await Promise.all([
        api.get('/analytics/overview'),
        api.get(`/analytics/trends?range=${trendRange}`),
        api.get('/analytics/distribution'),
        api.get('/analytics/sensors'),
        api.get('/analytics/evidence'),
        api.get('/analytics/alerts'),
        api.get('/analytics/device'),
        api.get('/analytics/insights'),
        api.get('/analytics/peak-hours')
      ]);

      setOverview(resOverview.data);
      setTrends(resTrends.data);
      setDistribution(resDistribution.data);
      setSensors(resSensors.data);
      setEvidence(resEvidence.data);
      setAlerts(resAlerts.data);
      setDeviceHealth(resDevice.data);
      setInsights(resInsights.data);
      setPeakHours(resPeak.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [trendRange]);

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader
        title="Analytics"
        subtitle="Analyze historical pollution trends, sensor performance, environmental insights and system statistics."
      />

      <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 pb-24">
        
        {/* Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors opacity-60 cursor-not-allowed">
              <Calendar className="w-4 h-4" /> Daily Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors opacity-60 cursor-not-allowed">
              <Calendar className="w-4 h-4" /> Weekly Report
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors opacity-60 cursor-not-allowed">
              <FileText className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors opacity-60 cursor-not-allowed">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>

        {/* Overview */}
        <SummaryCards overview={overview} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Trend Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTrendRange(range)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trendRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
              <select
                value={activeMetric}
                onChange={(e) => setActiveMetric(e.target.value)}
                className="bg-white border border-[#DCEEFF] rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="aqi">AQI</option>
                <option value="pm25">PM2.5</option>
                <option value="pm10">PM10</option>
                <option value="mq135">MQ135 Gas</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
              </select>
            </div>
            <PollutionTrendChart data={trends} activeMetric={activeMetric} />
          </div>
          <div className="lg:col-span-1 pt-12 lg:pt-[52px]">
            <AQIDistribution data={distribution} />
          </div>
        </div>

        {/* Peak Hours & Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PeakPollutionHours data={peakHours} />
          <EnvironmentalInsights insights={insights} />
        </div>

        {/* Performance & Health */}
        <div className="pt-4">
          <h3 className="text-[18px] font-bold text-slate-800 mb-4 px-2">Sensor Performance</h3>
          <SensorPerformance sensors={sensors} />
        </div>

        {/* Alerts & Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-1">
            <AlertAnalytics data={alerts} />
          </div>
          <div className="lg:col-span-1">
            <EvidenceAnalytics data={evidence} />
          </div>
          <div className="lg:col-span-1">
            <DeviceHealth data={deviceHealth} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
