import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  Flame, 
  CloudFog, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Clock, 
  MapPin, 
  Camera, 
  RefreshCw, 
  ChevronRight, 
  AlertTriangle, 
  Zap,
  Radio,
  ExternalLink,
  BellRing,
  X
} from 'lucide-react';
import api from '../services/api';
import getSocket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { getEvidenceImageUrl } from '../utils/imageUrl';
import NotificationDropdown from '../components/NotificationDropdown';

// Custom Map Marker Pin for Field Incidents
const createFieldPin = (label, status, isFire) => {
  let pinBg = 'from-blue-600 to-indigo-500';
  let badgeColor = 'bg-slate-900 text-white border-slate-700';

  if (status === 'RESOLVED') {
    pinBg = 'from-emerald-600 to-teal-500';
    badgeColor = 'bg-emerald-950 text-emerald-200 border-emerald-500/40';
  } else if (status === 'UNDER INVESTIGATION') {
    pinBg = 'from-purple-600 to-indigo-500';
    badgeColor = 'bg-purple-950 text-purple-200 border-purple-500/40';
  } else if (status === 'ASSIGNED' || status === 'ACKNOWLEDGED') {
    pinBg = 'from-amber-500 to-orange-500';
    badgeColor = 'bg-amber-950 text-amber-200 border-amber-500/40';
  }

  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center group -translate-x-1/2 -translate-y-full pointer-events-auto">
      <div className={`${badgeColor} text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xl border whitespace-nowrap mb-1 flex items-center gap-1`}>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
        <span>{label}</span>
      </div>
      <div className={`relative flex items-center justify-center w-8 h-8 bg-gradient-to-tr ${pinBg} rounded-full border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] text-white`}>
        {isFire ? <Flame className="w-4 h-4" /> : <CloudFog className="w-4 h-4" />}
      </div>
      <div className="w-1.5 h-2 bg-slate-800 rotate-45 -mt-0.5 rounded-xs" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'field-incident-pin',
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46]
  });
};

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFireOfficer = user?.role === 'fire_officer';
  const basePath = isFireOfficer ? '/fire' : '/pollution';

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeAlert, setRealtimeAlert] = useState(null);

  // Fetch only assigned incidents
  const fetchAssignedIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/evidence');
      if (Array.isArray(data)) {
        // Filter by role
        const filtered = data.filter(item => {
          if (isFireOfficer) {
            return item.assignedDepartment === 'FIRE_OFFICER' || item.assignedOfficerRole === 'fire_officer';
          } else {
            return item.assignedDepartment === 'POLLUTION_OFFICER' || item.assignedOfficerRole === 'pollution_officer';
          }
        });
        filtered.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
        setIncidents(filtered);
      }
    } catch (err) {
      console.error('Error fetching officer incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [isFireOfficer]);

  useEffect(() => {
    fetchAssignedIncidents();
  }, [fetchAssignedIncidents]);

  // Realtime Socket.io Sync
  useEffect(() => {
    const socket = getSocket();

    const handleIncidentAssigned = (data) => {
      const isTarget = isFireOfficer 
        ? (data.assignedDepartment === 'FIRE_OFFICER' || data.assignedOfficerRole === 'fire_officer')
        : (data.assignedDepartment === 'POLLUTION_OFFICER' || data.assignedOfficerRole === 'pollution_officer');

      if (isTarget) {
        setRealtimeAlert(data);
        setIncidents(prev => {
          if (prev.some(i => i.evidenceId === data.evidenceId)) {
            return prev.map(i => i.evidenceId === data.evidenceId ? { ...i, ...data } : i);
          }
          return [data, ...prev];
        });
      }
    };

    const handleStatusUpdated = (data) => {
      setIncidents(prev => prev.map(inc => {
        if (inc.evidenceId === data.evidenceId || inc._id === data._id) {
          return { ...inc, ...data };
        }
        return inc;
      }));
    };

    socket.on('incident-assigned', handleIncidentAssigned);
    socket.on('incident-status-updated', handleStatusUpdated);

    return () => {
      socket.off('incident-assigned', handleIncidentAssigned);
      socket.off('incident-status-updated', handleStatusUpdated);
    };
  }, [isFireOfficer]);

  // KPI Calculations
  const metrics = useMemo(() => {
    const assigned = incidents.filter(i => (i.incidentStatus || 'ASSIGNED') === 'ASSIGNED' || i.incidentStatus === 'ACKNOWLEDGED').length;
    const investigating = incidents.filter(i => i.incidentStatus === 'UNDER INVESTIGATION').length;
    const resolved = incidents.filter(i => i.incidentStatus === 'RESOLVED').length;
    return {
      total: incidents.length,
      assigned,
      investigating,
      resolved
    };
  }, [incidents]);

  // Incidents with valid GPS for Map
  const mapIncidents = useMemo(() => {
    return incidents.filter(i => 
      typeof i.latitude === 'number' && 
      typeof i.longitude === 'number' && 
      i.latitude !== 0 && 
      i.longitude !== 0 && 
      !isNaN(i.latitude) && 
      !isNaN(i.longitude)
    );
  }, [incidents]);

  const defaultCenter = mapIncidents.length > 0 
    ? [mapIncidents[0].latitude, mapIncidents[0].longitude] 
    : [13.0827, 80.2707];

  const getStatusBadge = (st) => {
    switch(st) {
      case 'ASSIGNED': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'ACKNOWLEDGED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER INVESTIGATION': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Recent 5 alerts for overview
  const recentAlerts = useMemo(() => {
    return incidents.slice(0, 5);
  }, [incidents]);

  return (
    <div className="flex flex-col min-h-full w-full font-sans pb-20 bg-[#F8FBFF]">
      
      {/* Top Header Bar - Matching Authority Header Style */}
      <div className="bg-white border-b border-[#DCEEFF] px-4 sm:px-8 py-5">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border bg-blue-50 border-blue-200 text-blue-700">
                {isFireOfficer ? 'Fire Response Portal' : 'Pollution Control Portal'}
              </span>
              <span className="text-[12px] font-bold text-slate-500">
                Officer {user?.fullName || 'Assigned'}
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-black text-slate-900 mt-1 tracking-tight">
              Operational Overview
            </h1>
            <p className="text-[13.5px] text-slate-500 mt-0.5">
              Live monitoring of assigned environmental breaches, active telemetry alerts, and response operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/incidents`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold shadow-md transition-all cursor-pointer"
            >
              <span>Manage Assigned Incidents</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={fetchAssignedIncidents}
              className="p-2.5 bg-white border border-[#DCEEFF] rounded-xl text-slate-600 hover:text-blue-600 hover:bg-[#F0F7FF] transition-colors shadow-xs cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <NotificationDropdown />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 flex-1">
        
        {/* Real-Time Live Alert Banner */}
        <AnimatePresence>
          {realtimeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-slate-900 flex items-center gap-2">
                    New Alert Assigned: <span className="font-mono text-amber-700">{realtimeAlert.evidenceId}</span>
                  </h4>
                  <p className="text-[12.5px] text-slate-600 mt-0.5">
                    {realtimeAlert.locationName || realtimeAlert.location || 'Station Alert'} • {realtimeAlert.detectionType || 'Breach detected'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`${basePath}/incidents/${realtimeAlert.evidenceId || realtimeAlert._id}`}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12.5px] rounded-lg shadow-sm transition-all"
                >
                  Respond Now
                </Link>
                <button
                  type="button"
                  onClick={() => setRealtimeAlert(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Total Assigned</p>
              <h3 className="text-[26px] font-black text-slate-900 mt-0.5">{metrics.total}</h3>
              <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Department queue</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Pending Response</p>
              <h3 className="text-[26px] font-black text-amber-600 mt-0.5">{metrics.assigned}</h3>
              <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Awaiting investigation</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Under Investigation</p>
              <h3 className="text-[26px] font-black text-blue-600 mt-0.5">{metrics.investigating}</h3>
              <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Active field units</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Resolved Cases</p>
              <h3 className="text-[26px] font-black text-emerald-600 mt-0.5">{metrics.resolved}</h3>
              <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Remediation verified</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* MAP OF ASSIGNED INCIDENTS */}
        <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-[16px] font-extrabold text-slate-900">Incident Geolocation Map</h3>
            </div>
            <span className="text-[12px] font-bold text-slate-400">
              {mapIncidents.length} Mapped Alerts
            </span>
          </div>

          <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-[#DCEEFF] relative">
            {mapIncidents.length > 0 ? (
              <MapContainer
                center={defaultCenter}
                zoom={14}
                className="w-full h-full z-0"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {mapIncidents.map((inc) => (
                  <Marker
                    key={inc.evidenceId || inc._id}
                    position={[inc.latitude, inc.longitude]}
                    icon={createFieldPin(inc.evidenceId, inc.incidentStatus, isFireOfficer)}
                  >
                    <Popup>
                      <div className="p-1 font-sans">
                        <p className="font-bold text-[13px] text-slate-900">{inc.evidenceId}</p>
                        <p className="text-[11px] text-slate-500">{inc.locationName || inc.location}</p>
                        <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
                          {inc.voltage !== undefined ? `${Number(inc.voltage).toFixed(3)} V` : ''}
                        </p>
                        <Link
                          to={`${basePath}/incidents/${inc.evidenceId || inc._id}`}
                          className="mt-2 inline-block text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Open Response View →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <MapPin className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-[14px] font-bold text-slate-600">No active geolocation coordinates in current department queue</p>
              </div>
            )}
          </div>
        </div>

        {/* RECENT ASSIGNED ALERTS SUMMARY FEED */}
        <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-5 border-b border-[#E2F0FF] flex items-center justify-between bg-white">
            <div>
              <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Recent Assigned Alerts
              </h3>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Manage investigations and operational status in the Assigned Incidents portal.
              </p>
            </div>
            
            <Link
              to={`${basePath}/incidents`}
              className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>View & Manage All ({incidents.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-[14px] font-bold text-slate-700">Loading alerts...</p>
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-[17px] font-extrabold text-slate-800">No Alerts Currently Assigned</h4>
              <p className="text-[13.5px] text-slate-500 mt-1 max-w-md">
                All assigned department alerts are up to date.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAlerts.map((item) => {
                const resolvedImage = getEvidenceImageUrl(item.imageUrl);
                const currentSt = item.incidentStatus || 'ASSIGNED';
                const formattedTime = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                }) : 'N/A';

                return (
                  <div
                    key={item.evidenceId || item._id}
                    className="p-5 hover:bg-[#F8FBFF] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                  >
                    {/* Left: Thumbnail & Telemetry */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
                        {resolvedImage ? (
                          <img
                            src={resolvedImage}
                            alt={item.evidenceId}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[15px] font-black text-slate-900 font-mono">
                            {item.evidenceId}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentSt)}`}>
                            {currentSt}
                          </span>
                          <span className="text-[11.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.detectionType || 'Threshold Exceeded'}
                          </span>
                        </div>

                        <p className="text-[13px] font-medium text-slate-600 flex items-center gap-1.5 mt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{item.locationName || item.location || 'Location Not Configured'}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[12px] text-slate-400 mt-1 font-mono flex-wrap">
                          <span className="font-bold text-red-500">
                            {item.voltage !== undefined ? `${Number(item.voltage).toFixed(3)} V` : 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{item.sensorId || 'ESP32-CAM-001'}</span>
                          <span>•</span>
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Manage Action */}
                    <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
                      <Link
                        to={`${basePath}/incidents/${item.evidenceId || item._id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white shadow-sm transition-all cursor-pointer bg-blue-600 hover:bg-blue-700"
                      >
                        <span>Manage Alert</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OfficerDashboard;
