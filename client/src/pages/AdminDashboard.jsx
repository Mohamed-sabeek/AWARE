import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Radio, 
  AlertTriangle, 
  Camera as CameraIcon, 
  WifiOff, 
  RefreshCw 
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';
import { 
  ThresholdCard, 
  SensorReadingGraph, 
  SensorStatusCard 
} from '../components/dashboard/DashboardWidgets';

const formatTimeLabel = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  });
};

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-[360px] bg-white rounded-[24px] border border-[#DCEEFF]" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="min-h-[180px] bg-white rounded-[24px] border border-[#DCEEFF] p-6">
          <div className="w-10 h-10 bg-slate-200 rounded-xl mb-4" />
          <div className="w-24 h-4 bg-slate-200 rounded mb-2" />
          <div className="w-16 h-8 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-72 bg-white rounded-[24px] border border-[#DCEEFF]" />
      <div className="h-72 bg-white rounded-[24px] border border-[#DCEEFF]" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [liveSensor, setLiveSensor] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [latestEvidence, setLatestEvidence] = useState(null);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'LIVE' | 'CONNECTING' | 'DISCONNECTED'
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphError, setGraphError] = useState(null);

  const TARGET_DEVICE_ID = 'ESP32-CAM-001';

  // 1. Fetch initial data from MongoDB via backend REST endpoints
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview, sensor metadata, and historical graph points in parallel
      const [dashboardRes, sensorsRes, historyRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/sensors'),
        api.get(`/sensors/${TARGET_DEVICE_ID}/readings?limit=50`)
      ]);

      if (dashboardRes.status === 'fulfilled') {
        const stats = dashboardRes.value.data;
        setDashboardStats(stats);
        if (stats?.latestAlert) {
          setLatestAlert(stats.latestAlert);
        }
        if (stats?.latestEvidence) {
          setLatestEvidence(stats.latestEvidence);
        }
        if (stats?.evidenceCount !== undefined) {
          setEvidenceCount(stats.evidenceCount);
        }
      }

      if (sensorsRes.status === 'fulfilled') {
        const sensorsList = sensorsRes.value.data || [];
        const targetSensor = sensorsList.find(s => s.sensorId === TARGET_DEVICE_ID) || sensorsList[0] || null;
        if (targetSensor) {
          setLiveSensor(targetSensor);
        }
      }

      if (historyRes.status === 'fulfilled') {
        const rawReadings = historyRes.value.data?.data || [];
        // Parse and sort chronologically by numeric timestamp ascending
        const validReadings = rawReadings
          .map(r => {
            const d = new Date(r.timestamp);
            return {
              timeValue: d.getTime(),
              time: formatTimeLabel(r.timestamp),
              voltage: typeof r.voltage === 'number' ? r.voltage : parseFloat(r.voltage) || 0,
              timestamp: r.timestamp
            };
          })
          .filter(r => !isNaN(r.timeValue))
          .sort((a, b) => a.timeValue - b.timeValue);

        setGraphData(validReadings);
        setGraphError(null);
      } else {
        setGraphError('Unable to load historical readings');
      }

      if (dashboardRes.status === 'rejected' && sensorsRes.status === 'rejected') {
        setError('Unable to load sensor data from backend');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load sensor data');
    } finally {
      setLoading(false);
      setGraphLoading(false);
    }
  }, [TARGET_DEVICE_ID]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 2. Real-time Socket.io Subscription
  useEffect(() => {
    const socket = getSocket();

    // Connection lifecycle handlers
    const onConnect = () => {
      setConnectionStatus('LIVE');
    };

    const onDisconnect = () => {
      setConnectionStatus('DISCONNECTED');
    };

    const onConnectError = () => {
      setConnectionStatus('DISCONNECTED');
    };

    if (socket.connected) {
      setConnectionStatus('LIVE');
    } else {
      setConnectionStatus('CONNECTING');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Incoming real-time sensor reading
    const onSensorReading = (data) => {
      if (!data) return;
      const incomingDeviceId = data.deviceId || data.sensorId;
      if (incomingDeviceId !== TARGET_DEVICE_ID) return;

      const newVoltage = typeof data.voltage === 'number' ? data.voltage : parseFloat(data.voltage) || 0;
      const newThreshold = data.threshold !== undefined ? data.threshold : (liveSensor?.threshold || 0.400);
      const newTimestamp = data.timestamp || new Date().toISOString();
      const newDate = new Date(newTimestamp);
      const newTimeVal = newDate.getTime();
      if (isNaN(newTimeVal)) return;

      // Update current sensor state in state
      setLiveSensor(prev => ({
        ...(prev || {}),
        sensorId: incomingDeviceId,
        voltage: newVoltage,
        threshold: newThreshold,
        status: 'Online',
        lastUpdated: newTimestamp
      }));

      // Append new point to graph (keep latest 50 points, sort chronologically by timeValue)
      setGraphData(prev => {
        const newPoint = {
          timeValue: newTimeVal,
          time: formatTimeLabel(newTimestamp),
          voltage: newVoltage,
          timestamp: newTimestamp
        };
        
        // Avoid duplicate push if timestamp or timeValue matches an existing point
        if (prev.some(p => p.timestamp === newTimestamp || p.timeValue === newTimeVal)) {
          return prev;
        }

        const updated = [...prev, newPoint].sort((a, b) => a.timeValue - b.timeValue);
        return updated.slice(-50);
      });
    };

    // Incoming threshold breach alert
    const onSensorAlert = (data) => {
      if (!data) return;
      const incomingDeviceId = data.deviceId || data.sensorId;
      if (incomingDeviceId !== TARGET_DEVICE_ID) return;

      setLatestAlert({
        severity: data.severity || 'Critical',
        message: data.message || `Gas sensor voltage (${data.voltage} V) reached threshold (${data.threshold} V).`,
        timestamp: data.timestamp || new Date().toISOString(),
        voltage: data.voltage,
        threshold: data.threshold,
        deviceId: incomingDeviceId,
        status: 'Active'
      });
    };

    // Incoming visual evidence capture
    const onEvidenceCaptured = (data) => {
      if (!data) return;
      setLatestEvidence(data);
      setEvidenceCount(prev => prev + 1);
    };

    socket.on('sensor-reading', onSensorReading);
    socket.on('sensor-alert', onSensorAlert);
    socket.on('evidence-captured', onEvidenceCaptured);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('sensor-reading', onSensorReading);
      socket.off('sensor-alert', onSensorAlert);
      socket.off('evidence-captured', onEvidenceCaptured);
    };
  }, [TARGET_DEVICE_ID, liveSensor?.threshold]);

  // Derived values for components
  const currentVoltage = liveSensor?.voltage !== undefined 
    ? liveSensor.voltage 
    : (dashboardStats?.latestReading?.voltage !== undefined ? dashboardStats.latestReading.voltage : 0);

  const threshold = liveSensor?.threshold !== undefined 
    ? liveSensor.threshold 
    : 0.400;

  const deviceId = liveSensor?.sensorId || TARGET_DEVICE_ID;
  const isAlert = currentVoltage >= threshold;
  const status = isAlert ? 'ALERT' : 'NORMAL';
  const isOnline = liveSensor?.status ? liveSensor.status.toLowerCase() === 'online' : true;
  const lastUpdated = liveSensor?.lastUpdated || dashboardStats?.latestReading?.timestamp || dashboardStats?.lastUpdated;

  const onlineCount = dashboardStats?.onlineDevices !== undefined ? dashboardStats.onlineDevices : (liveSensor ? 1 : 0);
  const totalCount = dashboardStats?.totalDevices !== undefined ? dashboardStats.totalDevices : (liveSensor ? 1 : 0);
  const activeAlertsCount = dashboardStats?.activeAlerts !== undefined ? dashboardStats.activeAlerts : (isAlert ? 1 : 0);
  const totalEvidenceCount = evidenceCount || dashboardStats?.evidenceCount || 0;

  return (
    <div className="flex flex-col min-h-full w-full">
      {/* Top Header */}
      <PageHeader 
        title="Dashboard"
        description="Live environmental gas sensor monitoring & automated visual surveillance platform."
      />

      {/* Main Container */}
      <div className="p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto pb-24 space-y-8">
        
        {/* Error Notification Banner */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {loading && !dashboardStats && !liveSensor ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* =======================================================
                1. SENSOR READING GRAPH (ABOVE SUMMARY CARDS)
               ======================================================= */}
            <section aria-label="Sensor Reading Graph">
              <SensorReadingGraph 
                data={graphData}
                threshold={threshold}
                loading={graphLoading}
                error={graphError}
              />
            </section>

            {/* =======================================================
                2. FOUR SUMMARY CARDS
               ======================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <PremiumSummaryCard 
                title="Current Reading" 
                value={currentVoltage} 
                decimals={3}
                total={threshold} 
                trendVal={isAlert ? "Threshold Exceeded" : "Normal (Safe)"}
                trendDir={isAlert ? "down" : "up"}
                trendPeriod=""
                statusText={connectionStatus === 'LIVE' ? "Live Stream" : connectionStatus === 'CONNECTING' ? "Connecting" : "Offline"}
                icon={Activity} 
                themeColor={isAlert ? "#EF4444" : "#3B82F6"} 
                gradientBg={isAlert ? "from-red-50/50 to-transparent" : "from-blue-50/50 to-transparent"}
                percentageOverride={threshold > 0 ? Math.min(Math.round((currentVoltage / threshold) * 100), 100) : 0}
              />
              <PremiumSummaryCard 
                title="Online Sensors" 
                value={onlineCount} 
                total={totalCount} 
                trendVal={deviceId}
                trendDir={isOnline ? "up" : "down"}
                trendPeriod=""
                statusText={isOnline ? "Connected" : "Offline"}
                icon={Radio} 
                themeColor="#10B981" 
                gradientBg="from-emerald-50/50 to-transparent"
                percentageOverride={totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0}
              />
              <PremiumSummaryCard 
                title="Active Alerts" 
                value={activeAlertsCount} 
                total={1} 
                trendVal={activeAlertsCount > 0 ? "Action needed" : "All Clear"}
                trendDir={activeAlertsCount > 0 ? "down" : "none"}
                trendPeriod=""
                statusText={activeAlertsCount > 0 ? "Alert Active" : "Safe"}
                icon={AlertTriangle} 
                themeColor="#EF4444" 
                gradientBg="from-red-50/50 to-transparent"
                percentageOverride={activeAlertsCount > 0 ? 100 : 0}
              />
              <PremiumSummaryCard 
                title="Evidence Captured" 
                value={totalEvidenceCount} 
                total={0} 
                trendVal="Standby Ready"
                trendDir="none"
                trendPeriod=""
                statusText="Standby"
                icon={CameraIcon} 
                themeColor="#8B5CF6" 
                gradientBg="from-purple-50/50 to-transparent"
                percentageOverride={0}
              />
            </div>

            {/* =======================================================
                3. THRESHOLD CONFIG + ESP32-CAM-001 (SENSOR STATUS)
               ======================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThresholdCard 
                threshold={threshold}
                current={currentVoltage}
                status={status}
              />
              <SensorStatusCard 
                device={deviceId}
                status={isOnline ? "ONLINE" : "OFFLINE"}
                reading={currentVoltage}
                lastUpdated={lastUpdated}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
