import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  RefreshCw, 
  Eye, 
  Camera, 
  CheckCircle, 
  Radio, 
  X, 
  BellRing, 
  ExternalLink,
  Video
} from 'lucide-react';
import api, { API_URL } from '../services/api';
import getSocket from '../services/socket';
import PageHeader from '../components/PageHeader';
import { getEvidenceImageUrl } from '../utils/imageUrl';

// Custom Map Marker for Incidents
const createIncidentPin = (label, status) => {
  let pinBg = 'from-red-600 to-rose-500';
  let pulseBg = 'bg-red-500';
  let badgeColor = 'bg-red-950 text-red-200 border-red-500/40';

  if (status === 'ACKNOWLEDGED') {
    pinBg = 'from-amber-500 to-orange-500';
    pulseBg = 'bg-amber-500';
    badgeColor = 'bg-amber-950 text-amber-200 border-amber-500/40';
  } else if (status === 'UNDER INVESTIGATION') {
    pinBg = 'from-blue-600 to-indigo-500';
    pulseBg = 'bg-blue-500';
    badgeColor = 'bg-blue-950 text-blue-200 border-blue-500/40';
  } else if (status === 'RESOLVED') {
    pinBg = 'from-emerald-600 to-teal-500';
    pulseBg = 'bg-emerald-500';
    badgeColor = 'bg-emerald-950 text-emerald-200 border-emerald-500/40';
  }

  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center group -translate-x-1/2 -translate-y-full pointer-events-auto">
      <div className={`${badgeColor} text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xl border whitespace-nowrap mb-1 flex items-center gap-1`}>
        <div className={`w-1.5 h-1.5 rounded-full ${pulseBg} animate-ping`} />
        <span>{label}</span>
      </div>
      <div className={`relative flex items-center justify-center w-8 h-8 bg-gradient-to-tr ${pinBg} rounded-full border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] text-white`}>
        <ShieldAlert className="w-4 h-4 drop-shadow-sm" strokeWidth={2.5} />
      </div>
      <div className="w-1.5 h-2 bg-slate-800 rotate-45 -mt-0.5 rounded-xs" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'incident-pin-marker',
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46]
  });
};

// Smooth Map Panner
const MapPanner = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// Stable timestamp comparator (Newest first)
const compareIncidentsDesc = (a, b) => {
  const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
  const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
  if (timeB !== timeA) {
    return timeB - timeA;
  }
  return String(b.evidenceId || '').localeCompare(String(a.evidenceId || ''));
};

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [kpiStats, setKpiStats] = useState({
    activeCount: 0,
    newTodayCount: 0,
    resolvedCount: 0,
    totalCount: 0,
    onlineNodesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Realtime notification banner
  const [realtimeAlert, setRealtimeAlert] = useState(null);

  // Map state
  const [mapCenter, setMapCenter] = useState([11.016800, 76.955800]);
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch initial data (system stats + incidents)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, evidenceRes, sensorsRes] = await Promise.allSettled([
        api.get('/evidence/stats'),
        api.get('/evidence'),
        api.get('/sensors')
      ]);

      // 1. Process System-wide KPI stats
      let active = 0;
      let newToday = 0;
      let resolved = 0;
      let total = 0;

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        active = statsRes.value.data.activeCount || 0;
        newToday = statsRes.value.data.newTodayCount || 0;
        resolved = statsRes.value.data.resolvedCount || 0;
        total = statsRes.value.data.totalCount || 0;
      }

      let onlineSensors = 0;
      if (sensorsRes.status === 'fulfilled' && Array.isArray(sensorsRes.value.data)) {
        onlineSensors = sensorsRes.value.data.filter(s => s.status === 'Online').length || sensorsRes.value.data.length;
      }

      // 2. Process Incidents
      if (evidenceRes.status === 'fulfilled' && Array.isArray(evidenceRes.value.data)) {
        const formatted = evidenceRes.value.data.map(item => ({
          ...item,
          incidentStatus: item.incidentStatus || (item.status === 'Verified' ? 'NEW' : 'RESOLVED')
        }));

        // Sort newest first
        formatted.sort(compareIncidentsDesc);
        setIncidents(formatted);

        // Fallback calculations if stats endpoint wasn't available
        if (statsRes.status !== 'fulfilled') {
          active = formatted.filter(i => i.incidentStatus !== 'RESOLVED').length;
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          newToday = formatted.filter(i => new Date(i.createdAt).getTime() >= oneDayAgo).length;
          resolved = formatted.filter(i => i.incidentStatus === 'RESOLVED').length;
          total = formatted.length;
        }

        // Center map on latest incident with valid coords
        const withCoords = formatted.find(i => typeof i.latitude === 'number' && typeof i.longitude === 'number' && i.latitude !== 0);
        if (withCoords) {
          setMapCenter([withCoords.latitude, withCoords.longitude]);
        }
      }

      setKpiStats({
        activeCount: active,
        newTodayCount: newToday,
        resolvedCount: resolved,
        totalCount: total,
        onlineNodesCount: onlineSensors || 1
      });

    } catch (err) {
      console.error('Error fetching authority dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io Realtime Subscriptions
  useEffect(() => {
    const socket = getSocket();

    // 1. When a new evidence/incident is captured by ESP32-CAM
    const handleEvidenceCaptured = (data) => {
      const targetSensorId = data.sensorId || data.deviceId || 'ESP32-CAM-001';
      const liveStreamUrl = data.liveStreamUrl || null;

      const newIncident = {
        _id: data.evidenceId || String(Date.now()),
        evidenceId: data.evidenceId,
        imageUrl: data.imageUrl,
        sensorId: targetSensorId,
        voltage: data.voltage,
        detectionType: data.detectionType || 'Threshold Exceeded',
        locationName: data.locationName || data.location || 'ESP32 Station',
        location: data.locationName || data.location || 'ESP32 Station',
        latitude: data.latitude,
        longitude: data.longitude,
        liveStreamUrl,
        incidentStatus: data.incidentStatus || 'NEW',
        status: data.status || 'Verified',
        confidence: 95,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString()
      };

      // Realtime Duplicate Protection & Dynamic Sorting
      setIncidents(prev => {
        const exists = prev.some(i => i.evidenceId === newIncident.evidenceId);
        if (exists) return prev;
        const updated = [newIncident, ...prev];
        updated.sort(compareIncidentsDesc);
        return updated;
      });

      // Update Live System-wide Summary Counters
      setKpiStats(prev => ({
        ...prev,
        activeCount: prev.activeCount + 1,
        newTodayCount: prev.newTodayCount + 1,
        totalCount: prev.totalCount + 1
      }));

      // Show real-time notification banner
      setRealtimeAlert({
        evidenceId: newIncident.evidenceId,
        sensorId: newIncident.sensorId,
        location: newIncident.locationName,
        voltage: newIncident.voltage,
        liveStreamUrl: newIncident.liveStreamUrl,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      });

      // Smoothly fly map to new incident if coordinates exist
      if (typeof newIncident.latitude === 'number' && typeof newIncident.longitude === 'number' && newIncident.latitude !== 0) {
        setMapCenter([newIncident.latitude, newIncident.longitude]);
        setMapZoom(16);
      }
    };

    // 2. When incident status changes
    const handleStatusUpdated = (data) => {
      setIncidents(prev => prev.map(inc => {
        if (inc.evidenceId === data.evidenceId || inc._id === data._id) {
          return { ...inc, incidentStatus: data.incidentStatus };
        }
        return inc;
      }));

      // Refresh KPIs on status change
      if (data.incidentStatus === 'RESOLVED') {
        setKpiStats(prev => ({
          ...prev,
          activeCount: Math.max(0, prev.activeCount - 1),
          resolvedCount: prev.resolvedCount + 1
        }));
      }
    };

    socket.on('evidence-captured', handleEvidenceCaptured);
    socket.on('incident-status-updated', handleStatusUpdated);

    return () => {
      socket.off('evidence-captured', handleEvidenceCaptured);
      socket.off('incident-status-updated', handleStatusUpdated);
    };
  }, []);

  // Strict Latest 5 Incidents Computation (Filtered by Search if provided)
  const latestFiveIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = incidents.filter(item => {
      const idMatch = (item.evidenceId || '').toLowerCase().includes(q);
      const devMatch = (item.sensorId || item.deviceId || '').toLowerCase().includes(q);
      const locMatch = (item.locationName || item.location || '').toLowerCase().includes(q);
      return !q || idMatch || devMatch || locMatch;
    });

    // Ensure sorted by timestamp descending and strictly cap at 5
    filtered.sort(compareIncidentsDesc);
    return filtered.slice(0, 5);
  }, [incidents, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-50 text-red-600 border-red-200 animate-pulse';
      case 'ACKNOWLEDGED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'UNDER INVESTIGATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full font-sans pb-16">
      
      {/* Top Header */}
      <PageHeader 
        title="Environmental Incident Response" 
        description="Live incident detection, telemetry review, field dispatch, and regulatory compliance verification."
      >
        <div className="flex items-center gap-3">
          <Link
            to="/authority/evidence"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-[13px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>View All Evidence ({kpiStats.totalCount})</span>
          </Link>
          <button 
            type="button"
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </PageHeader>

      {/* Realtime Incident Notification Banner */}
      <AnimatePresence>
        {realtimeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1600px] mx-auto w-full px-6 lg:px-8 mt-4"
          >
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-red-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 animate-bounce text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black tracking-widest uppercase bg-white text-red-600 px-2 py-0.5 rounded-md">
                      NEW REALTIME BREACH
                    </span>
                    <span className="text-[12px] opacity-90">{realtimeAlert.time}</span>
                  </div>
                  <p className="text-[14px] font-extrabold mt-0.5">
                    {realtimeAlert.evidenceId} • {realtimeAlert.sensorId} at {realtimeAlert.location || 'Active Station'} (Voltage: {Number(realtimeAlert.voltage || 0).toFixed(3)} V)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {realtimeAlert.liveStreamUrl && (
                  <a
                    href={realtimeAlert.liveStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[13px] font-bold border border-white/40 shadow-xs transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>View Live Camera</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/authority/incidents/${realtimeAlert.evidenceId}`);
                    setRealtimeAlert(null);
                  }}
                  className="px-4 py-2 bg-white text-red-600 rounded-xl text-[13px] font-bold hover:bg-red-50 shadow-md transition-all cursor-pointer"
                >
                  View & Respond
                </button>
                <button
                  type="button"
                  onClick={() => setRealtimeAlert(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex flex-col gap-6 flex-1">
        
        {/* TOP SYSTEM-WIDE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active Incidents */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Active Incidents</p>
              <h3 className="text-[28px] font-black text-slate-900 mt-1 font-mono">{kpiStats.activeCount}</h3>
              <p className="text-[12px] font-medium text-red-500 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires Action
              </p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: New Today */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">New Today</p>
              <h3 className="text-[28px] font-black text-blue-600 mt-1 font-mono">{kpiStats.newTodayCount}</h3>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Last 24 Hours</p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Resolved Incidents</p>
              <h3 className="text-[28px] font-black text-emerald-600 mt-1 font-mono">{kpiStats.resolvedCount}</h3>
              <p className="text-[12px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Clean
              </p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Online Nodes */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Monitoring Nodes</p>
              <h3 className="text-[28px] font-black text-slate-900 mt-1 font-mono">{kpiStats.onlineNodesCount}</h3>
              <p className="text-[12px] font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Deployment
              </p>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
              <Radio className="w-6 h-6 text-blue-600" />
            </div>
          </div>

        </div>

        {/* MAIN SECTION: Latest 5 Incidents (Left) + Response Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLUMNS: Latest 5 Incidents Feed */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Search Bar (Cleaned of Status Tabs) */}
            <div className="bg-white border border-[#DCEEFF] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search incident ID, device, or station name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Incidents List Container */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-4.5 border-b border-[#E2F0FF] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="text-[16px] font-extrabold text-slate-900">Incident Feed</h3>
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    Latest 5
                  </span>
                </div>
                <span className="text-[12px] font-bold text-slate-500">
                  Showing {latestFiveIncidents.length} of {Math.min(5, incidents.length)} displayed
                </span>
              </div>

              {/* Incident Feed Items (Strictly Maximum 5) */}
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-[14px] font-bold text-slate-700">Loading Environmental Incidents...</p>
                </div>
              ) : latestFiveIncidents.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-[16px] font-extrabold text-slate-800">No Environmental Incidents Recorded</h4>
                  <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
                    {incidents.length === 0 
                      ? 'No environmental threshold breaches have been recorded.' 
                      : 'No incidents match your search criteria.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {latestFiveIncidents.map((incident) => {
                    const resolvedImage = getEvidenceImageUrl(incident.imageUrl);
                    const formattedTime = incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    }) : 'Time unavailable';

                    const currentStatus = incident.incidentStatus || 'NEW';
                    const targetId = incident.evidenceId || incident._id;

                    return (
                      <div 
                        key={incident.evidenceId || incident._id}
                        className="p-4.5 hover:bg-[#F8FBFF] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Image Thumbnail */}
                          <div className="w-16 h-16 rounded-xl bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
                            {resolvedImage ? (
                              <img 
                                src={resolvedImage} 
                                alt={incident.evidenceId}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-slate-500" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-extrabold text-slate-900 truncate">
                                {incident.evidenceId}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentStatus)}`}>
                                {currentStatus}
                              </span>
                            </div>

                            <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{incident.locationName || incident.location || 'Location Not Configured'}</span>
                            </p>

                            {incident.assignedDepartment && (
                              <p className="text-[11.5px] font-bold text-slate-700 mt-1 flex items-center gap-1">
                                <span>Assigned:</span>
                                <span className={incident.assignedDepartment === 'FIRE_OFFICER' ? 'text-red-600' : 'text-emerald-600'}>
                                  {incident.assignedDepartment === 'FIRE_OFFICER' ? '🔥 Fire Officer' : '🌫️ Pollution Officer'}
                                  {incident.assignedOfficerName ? ` — ${incident.assignedOfficerName}` : ''}
                                </span>
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[11.5px] text-slate-400 mt-1 font-mono">
                              <span className="font-bold text-red-500">
                                {incident.voltage !== undefined ? `${Number(incident.voltage).toFixed(3)} V` : 'N/A'}
                              </span>
                              <span>•</span>
                              <span>{incident.sensorId || 'ESP32-CAM-001'}</span>
                              <span>•</span>
                              <span>{formattedTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Navigate to Dedicated Incident Response Page & Live Camera */}
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                          {incident.liveStreamUrl && (
                            <a
                              href={incident.liveStreamUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-[12px] font-bold border border-red-200 hover:border-red-600 transition-colors cursor-pointer"
                              title="Open Direct Live Camera Stream (No Login)"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>View Live Camera</span>
                            </a>
                          )}
                          <Link
                            to={`/authority/incidents/${targetId}`}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[12.5px] font-bold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View & Respond</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feed Footer: Access All Historical Evidence */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[12px] text-slate-500 font-medium">
                  Viewing top 5 newest events.
                </span>
                <Link
                  to="/authority/evidence"
                  className="text-[12.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span>View All Historical Records ({kpiStats.totalCount})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Map for Displayed Latest-5 Incidents */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col h-[640px]">
              
              {/* Map Header */}
              <div className="p-4 border-b border-[#E2F0FF] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[16px] font-extrabold text-slate-900">Incident Geolocation</h3>
                </div>
                <span className="text-[11.5px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {latestFiveIncidents.filter(i => typeof i.latitude === 'number' && typeof i.longitude === 'number' && i.latitude !== 0).length} Mapped
                </span>
              </div>

              {/* Map Canvas: Strictly Plots Markers for the Displayed Latest 5 */}
              <div className="flex-1 w-full h-full relative overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="w-full h-full z-0"
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  <MapPanner center={mapCenter} zoom={mapZoom} />

                  {/* Strictly Latest 5 Markers */}
                  {latestFiveIncidents.map((inc) => {
                    if (typeof inc.latitude !== 'number' || typeof inc.longitude !== 'number' || inc.latitude === 0) {
                      return null;
                    }

                    const targetId = inc.evidenceId || inc._id;

                    return (
                      <Marker
                        key={inc.evidenceId || inc._id}
                        position={[inc.latitude, inc.longitude]}
                        icon={createIncidentPin(inc.evidenceId, inc.incidentStatus || 'NEW')}
                        eventHandlers={{
                          click: () => navigate(`/authority/incidents/${targetId}`)
                        }}
                      >
                        <Popup>
                          <div className="p-1 font-sans">
                            <h4 className="font-bold text-[13px] text-slate-900">{inc.evidenceId}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{inc.locationName || inc.location}</p>
                            <p className="text-[12px] font-bold text-red-600 font-mono mt-1">
                              {inc.voltage ? `${Number(inc.voltage).toFixed(3)} V` : 'Threshold Breach'}
                            </p>
                            <Link
                              to={`/authority/incidents/${targetId}`}
                              className="mt-2 block w-full py-1 text-center bg-blue-600 text-white text-[11px] font-bold rounded-md hover:bg-blue-700"
                            >
                              Open Response Page
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthorityDashboard;
