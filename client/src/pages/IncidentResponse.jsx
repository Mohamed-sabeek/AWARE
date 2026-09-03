import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  ArrowLeft, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  CheckCircle,
  Clock, 
  MapPin, 
  Camera, 
  FileText, 
  Download, 
  RefreshCw, 
  Activity, 
  Eye, 
  AlertCircle,
  Radio,
  FileCheck,
  Building2,
  Calendar,
  Zap,
  Info,
  Search,
  Filter,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import getSocket from '../services/socket';
import { getEvidenceImageUrl } from '../utils/imageUrl';
import { generateEvidencePDF, downloadEvidenceImage } from '../utils/evidenceActions';

// Custom Incident Pin Marker
const createLocationPin = (label, status) => {
  let pinBg = 'from-red-600 to-rose-500';
  let badgeColor = 'bg-red-950 text-red-200 border-red-500/40';

  if (status === 'ACKNOWLEDGED') {
    pinBg = 'from-amber-500 to-orange-500';
    badgeColor = 'bg-amber-950 text-amber-200 border-amber-500/40';
  } else if (status === 'UNDER INVESTIGATION') {
    pinBg = 'from-blue-600 to-indigo-500';
    badgeColor = 'bg-blue-950 text-blue-200 border-blue-500/40';
  } else if (status === 'RESOLVED') {
    pinBg = 'from-emerald-600 to-teal-500';
    badgeColor = 'bg-emerald-950 text-emerald-200 border-emerald-500/40';
  }

  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center group -translate-x-1/2 -translate-y-full pointer-events-auto">
      <div className={`${badgeColor} text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xl border whitespace-nowrap mb-1`}>
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
    className: 'incident-response-pin',
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46]
  });
};

const IncidentResponse = () => {
  const { incidentId } = useParams();
  const navigate = useNavigate();

  // All incidents list state (for /authority/incidents)
  const [allIncidents, setAllIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Single incident state (for /authority/incidents/:incidentId)
  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Fetch data depending on whether a specific incidentId is in the URL or not
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (incidentId) {
        // Mode 1: Fetch Single Incident
        const [evidenceRes, logsRes] = await Promise.allSettled([
          api.get(`/evidence/${incidentId}`),
          api.get('/activity-logs')
        ]);

        if (evidenceRes.status === 'fulfilled' && evidenceRes.value.data) {
          const item = evidenceRes.value.data;
          setIncident({
            ...item,
            incidentStatus: item.incidentStatus || (item.status === 'Verified' ? 'NEW' : 'RESOLVED')
          });
        } else {
          setError(`Incident '${incidentId}' could not be located.`);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value.data) {
          const rawLogs = Array.isArray(logsRes.value.data) 
            ? logsRes.value.data 
            : (logsRes.value.data.logs || []);
            
          const related = rawLogs.filter(l => 
            l.metadata?.evidenceId === incidentId || 
            (l.description && l.description.includes(incidentId))
          );
          setLogs(related);
        }
      } else {
        // Mode 2: Fetch ALL Incidents for the Management Registry
        const res = await api.get('/evidence');
        if (Array.isArray(res.data)) {
          const formatted = res.data.map(item => ({
            ...item,
            incidentStatus: item.incidentStatus || (item.status === 'Verified' ? 'NEW' : 'RESOLVED')
          }));
          // Sort newest first
          formatted.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
          setAllIncidents(formatted);
        }
      }
    } catch (err) {
      console.error('Error fetching incident response data:', err);
      setError(err.response?.data?.message || 'Failed to load incident response data.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime synchronization via Socket.io
  useEffect(() => {
    const socket = getSocket();

    const handleEvidenceCaptured = (data) => {
      const newInc = {
        _id: data.evidenceId || String(Date.now()),
        evidenceId: data.evidenceId,
        imageUrl: data.imageUrl,
        sensorId: data.sensorId || data.deviceId || 'ESP32-CAM-001',
        voltage: data.voltage,
        detectionType: data.detectionType || 'Threshold Exceeded',
        locationName: data.locationName || data.location || 'ESP32 Station',
        location: data.locationName || data.location || 'ESP32 Station',
        latitude: data.latitude,
        longitude: data.longitude,
        incidentStatus: data.incidentStatus || 'NEW',
        status: data.status || 'Verified',
        confidence: 95,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString()
      };

      setAllIncidents(prev => {
        if (prev.some(i => i.evidenceId === newInc.evidenceId)) return prev;
        const updated = [newInc, ...prev];
        updated.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
        return updated;
      });
    };

    const handleStatusUpdated = (data) => {
      // Update in allIncidents list
      setAllIncidents(prev => prev.map(inc => {
        if (inc.evidenceId === data.evidenceId || inc._id === data._id) {
          return { ...inc, incidentStatus: data.incidentStatus };
        }
        return inc;
      }));

      // Update in single incident view if currently viewed
      if (incidentId && (data.evidenceId === incidentId || data._id === incidentId)) {
        setIncident(prev => prev ? { ...prev, incidentStatus: data.incidentStatus } : prev);
        api.get('/activity-logs').then(res => {
          const rawLogs = Array.isArray(res.data) ? res.data : (res.data?.logs || []);
          const related = rawLogs.filter(l => 
            l.metadata?.evidenceId === incidentId || 
            (l.description && l.description.includes(incidentId))
          );
          setLogs(related);
        }).catch(() => {});
      }
    };

    socket.on('evidence-captured', handleEvidenceCaptured);
    socket.on('incident-status-updated', handleStatusUpdated);

    return () => {
      socket.off('evidence-captured', handleEvidenceCaptured);
      socket.off('incident-status-updated', handleStatusUpdated);
    };
  }, [incidentId]);

  // Handle status transitions (supports both single detail view and list quick-actions)
  const handleStatusTransition = async (targetIncident, nextStatus) => {
    if (!targetIncident) return;
    setActionLoading(true);
    setActionFeedback({ type: '', message: '' });

    try {
      const targetId = targetIncident._id || targetIncident.evidenceId;
      const { data } = await api.put(`/evidence/${targetId}/incident-status`, {
        nextStatus,
        notes: actionNotes.trim()
      });

      if (data && data.success) {
        // Update single incident
        if (incident && (incident.evidenceId === targetIncident.evidenceId || incident._id === targetIncident._id)) {
          setIncident(prev => ({ ...prev, incidentStatus: nextStatus }));
        }

        // Update in allIncidents list
        setAllIncidents(prev => prev.map(i => {
          if (i.evidenceId === targetIncident.evidenceId || i._id === targetIncident._id) {
            return { ...i, incidentStatus: nextStatus };
          }
          return i;
        }));

        setActionFeedback({ type: 'success', message: `✓ Incident status successfully updated to ${nextStatus}` });
        setActionNotes('');

        // Refresh activity logs if in detail view
        if (incidentId) {
          const logsRes = await api.get('/activity-logs');
          const rawLogs = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.logs || []);
          const related = rawLogs.filter(l => 
            l.metadata?.evidenceId === incidentId || 
            (l.description && l.description.includes(incidentId))
          );
          setLogs(related);
        }
      } else {
        setActionFeedback({ type: 'error', message: data?.message || 'Failed to update incident status.' });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setActionFeedback({ 
        type: 'error', 
        message: err.response?.data?.message || err.message || 'Server error updating status.' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // PDF report generation
  const handleGeneratePDF = async (targetItem) => {
    const item = targetItem || incident;
    if (!item) return;
    setPdfGenerating(true);
    try {
      await generateEvidencePDF(item);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Image download
  const handleDownloadImage = (targetItem) => {
    const item = targetItem || incident;
    if (!item || !item.imageUrl) return;
    downloadEvidenceImage(item.imageUrl, item.evidenceId);
  };

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

  // Filtered Incidents for List Mode
  const filteredListIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allIncidents.filter(item => {
      const idMatch = (item.evidenceId || '').toLowerCase().includes(q);
      const devMatch = (item.sensorId || item.deviceId || '').toLowerCase().includes(q);
      const locMatch = (item.locationName || item.location || '').toLowerCase().includes(q);
      const matchesSearch = !q || idMatch || devMatch || locMatch;

      const currentStatus = item.incidentStatus || 'NEW';
      const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allIncidents, searchQuery, statusFilter]);

  // Dynamic Status Counts
  const statusCounts = useMemo(() => {
    const counts = { All: allIncidents.length, NEW: 0, ACKNOWLEDGED: 0, 'UNDER INVESTIGATION': 0, RESOLVED: 0 };
    allIncidents.forEach(item => {
      const st = item.incidentStatus || 'NEW';
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [allIncidents]);

  // Validate coordinates for detail mode
  const hasValidCoordinates = useMemo(() => {
    return incident && 
      typeof incident.latitude === 'number' && 
      typeof incident.longitude === 'number' && 
      incident.latitude !== 0 && 
      incident.longitude !== 0 && 
      !isNaN(incident.latitude) && 
      !isNaN(incident.longitude);
  }, [incident]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FBFF] p-6 text-center font-sans">
        <RefreshCw className="w-9 h-9 animate-spin text-blue-600 mb-3" />
        <h3 className="text-[17px] font-extrabold text-slate-800">
          {incidentId ? 'Loading Incident Response Record...' : 'Loading All Incidents & Alerts...'}
        </h3>
        <p className="text-[13px] text-slate-500 mt-1">Retrieving evidence telemetry snapshot and audit history</p>
      </div>
    );
  }

  // ==========================================
  // MODE 1: ALL INCIDENTS MANAGEMENT REGISTRY
  // (Rendered when URL is /authority/incidents)
  // ==========================================
  if (!incidentId) {
    return (
      <div className="flex flex-col min-h-full w-full font-sans pb-20">
        
        {/* Header */}
        <div className="bg-white border-b border-[#DCEEFF] px-4 sm:px-8 py-5">
          <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  Authority Portal
                </span>
                <span className="text-[12px] font-bold text-slate-500">
                  {allIncidents.length} Total Incidents
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-black text-slate-900 mt-1 tracking-tight">
                Incident & Alerts Management
              </h1>
              <p className="text-[13.5px] text-slate-500 mt-0.5">
                Review, filter, acknowledge, and resolve all captured environmental threshold alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Registry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 flex-1">
          
          {/* Feedback Alert */}
          {actionFeedback.message && (
            <div className={`p-4 rounded-2xl text-[13.5px] font-bold border flex items-center justify-between gap-3 shadow-xs ${
              actionFeedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {actionFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback({ type: '', message: '' })}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* FILTER & SEARCH TOOLBAR */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-4.5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Evidence ID, Device, or Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[13.5px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
              {[
                { id: 'All', label: 'All', count: statusCounts.All },
                { id: 'NEW', label: 'New', count: statusCounts.NEW },
                { id: 'ACKNOWLEDGED', label: 'Acknowledged', count: statusCounts.ACKNOWLEDGED },
                { id: 'UNDER INVESTIGATION', label: 'Investigation', count: statusCounts['UNDER INVESTIGATION'] },
                { id: 'RESOLVED', label: 'Resolved', count: statusCounts.RESOLVED },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* ALL INCIDENTS LIST */}
          <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-[#E2F0FF] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <h3 className="text-[17px] font-extrabold text-slate-900">All Environmental Incidents</h3>
              </div>
              <span className="text-[12.5px] font-bold text-slate-500">
                Showing {filteredListIncidents.length} of {allIncidents.length} Records
              </span>
            </div>

            {filteredListIncidents.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-[17px] font-extrabold text-slate-800">No Matching Incidents Found</h4>
                <p className="text-[13.5px] text-slate-500 mt-1 max-w-md">
                  {allIncidents.length === 0 
                    ? 'No environmental threshold breaches have been recorded yet.' 
                    : 'No incidents match your selected status and search filters.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredListIncidents.map((item) => {
                  const resolvedImage = getEvidenceImageUrl(item.imageUrl);
                  const currentSt = item.incidentStatus || 'NEW';
                  const formattedTime = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  }) : 'N/A';

                  return (
                    <div 
                      key={item.evidenceId || item._id}
                      className="p-5 hover:bg-[#F8FBFF] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group"
                    >
                      {/* Left: Thumbnail & Telemetry */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-18 h-18 rounded-2xl bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
                          {resolvedImage ? (
                            <img 
                              src={resolvedImage} 
                              alt={item.evidenceId}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Camera className="w-7 h-7 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[15px] font-black text-slate-900 font-mono">
                              {item.evidenceId}
                            </span>
                            <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentSt)}`}>
                              {currentSt}
                            </span>
                            <span className="text-[11.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.detectionType || 'Threshold Exceeded'}
                            </span>
                          </div>

                          <p className="text-[13px] font-medium text-slate-600 flex items-center gap-1.5 mt-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{item.locationName || item.location || 'Location Not Configured'}</span>
                          </p>

                          <div className="flex items-center gap-3 text-[12px] text-slate-400 mt-1.5 font-mono flex-wrap">
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

                      {/* Right: Quick Action & Details Link */}
                      <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end flex-wrap">
                        
                        {/* Status Transition Action Buttons */}
                        {currentSt === 'NEW' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusTransition(item, 'ACKNOWLEDGED')}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        {currentSt === 'ACKNOWLEDGED' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusTransition(item, 'UNDER INVESTIGATION')}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Investigate</span>
                          </button>
                        )}

                        {currentSt === 'UNDER INVESTIGATION' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleStatusTransition(item, 'RESOLVED')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}

                        {/* Full Response Detail View Button */}
                        <Link
                          to={`/authority/incidents/${item.evidenceId || item._id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-[12.5px] font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details & Respond</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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
  }

  // ==========================================
  // MODE 2: SINGLE INCIDENT RESPONSE DETAIL
  // (Rendered when URL is /authority/incidents/:incidentId)
  // ==========================================
  if (error || !incident) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FBFF] p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-[18px] font-extrabold text-slate-900">{error || 'Incident Not Found'}</h3>
        <p className="text-[13px] text-slate-500 mt-1 max-w-md">
          The requested environmental incident could not be found or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/authority/incidents')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[13.5px] shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Incidents</span>
        </button>
      </div>
    );
  }

  const resolvedImageUrl = getEvidenceImageUrl(incident.imageUrl);
  const currentStatus = incident.incidentStatus || 'NEW';

  return (
    <div className="flex flex-col min-h-full w-full font-sans pb-20">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#DCEEFF] px-4 sm:px-8 py-5">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link
              to="/authority/incidents"
              className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Back to All Incidents"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  Incident Response
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentStatus)}`}>
                  {currentStatus}
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 mt-1 tracking-tight font-mono">
                {incident.evidenceId}
              </h1>
            </div>
          </div>

          {/* Quick PDF & Download Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={pdfGenerating}
              onClick={() => handleGeneratePDF(incident)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {pdfGenerating ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> : <FileText className="w-4 h-4 text-emerald-600" />}
              <span>Generate Official PDF</span>
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 bg-white border border-[#DCEEFF] rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
              title="Refresh Incident Details"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 flex-1">
        
        {/* Feedback Alert */}
        {actionFeedback.message && (
          <div className={`p-4 rounded-2xl text-[13.5px] font-bold border flex items-center justify-between gap-3 shadow-xs ${
            actionFeedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {actionFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback({ type: '', message: '' })}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLUMNS: Visual Evidence + Location Snapshot */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* EVIDENCE IMAGE CARD */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-extrabold text-slate-900">Captured Visual Evidence</h3>
                </div>
                {resolvedImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(incident)}
                    className="flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                )}
              </div>

              {/* Image Preview Container */}
              <div className="w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[440px] border border-slate-200 relative">
                {resolvedImageUrl ? (
                  <img 
                    src={resolvedImageUrl} 
                    alt={incident.evidenceId}
                    className="w-full h-full max-h-[440px] object-contain"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-[14px] font-bold">Evidence image unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* IMMUTABLE LOCATION SNAPSHOT CARD */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-extrabold text-slate-900">Point-in-Time Location Snapshot</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Immutable Coordinates
                </span>
              </div>

              <div className="p-4 bg-[#F8FBFF] border border-[#DCEEFF] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recorded Deployment Station</p>
                  <p className="text-[15px] font-extrabold text-slate-900 mt-0.5">
                    {incident.locationName || incident.location || 'Location Not Configured'}
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono text-[13px] text-slate-600">
                  <p>Latitude: <span className="font-bold text-slate-900">{typeof incident.latitude === 'number' && incident.latitude !== 0 ? incident.latitude.toFixed(6) : 'N/A'}</span></p>
                  <p>Longitude: <span className="font-bold text-slate-900">{typeof incident.longitude === 'number' && incident.longitude !== 0 ? incident.longitude.toFixed(6) : 'N/A'}</span></p>
                </div>
              </div>

              {/* Leaflet Map Preview */}
              <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-slate-200 relative">
                {hasValidCoordinates ? (
                  <MapContainer
                    center={[incident.latitude, incident.longitude]}
                    zoom={16}
                    className="w-full h-full z-0"
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker
                      position={[incident.latitude, incident.longitude]}
                      icon={createLocationPin(incident.evidenceId, currentStatus)}
                    >
                      <Popup>
                        <div className="p-1 font-sans">
                          <p className="font-bold text-[12px] text-slate-900">{incident.evidenceId}</p>
                          <p className="text-[11px] text-slate-500">{incident.locationName || incident.location}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MapPin className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                    <p className="text-[14px] font-bold text-slate-600">Location coordinates unavailable</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">Physical geolocation was not attached to this evidence packet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Incident Telemetry + Authority Workflow + Activity History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* INCIDENT INFORMATION GRID */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-[17px] font-extrabold text-slate-900">Incident Telemetry</h3>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Detection Type</p>
                  <p className="text-[14px] font-extrabold text-slate-900 mt-0.5 truncate">{incident.detectionType || 'Threshold Exceeded'}</p>
                </div>
                <div className="p-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Sensor Voltage</p>
                  <p className="text-[15px] font-bold text-red-600 font-mono mt-0.5">
                    {incident.voltage !== undefined ? `${Number(incident.voltage).toFixed(3)} V` : 'N/A'}{' '}
                    <span className="text-[11px] text-slate-400 font-sans">(Limit: 0.500V)</span>
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Reporting Node</p>
                  <p className="text-[13.5px] font-bold text-slate-800 font-mono mt-0.5 truncate">{incident.sensorId || 'ESP32-CAM-001'}</p>
                </div>
                <div className="p-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Detection Time</p>
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* AUTHORITY ACTION WORKFLOW CARD */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-extrabold text-slate-900">Authority Status Response</h3>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentStatus)}`}>
                  {currentStatus}
                </span>
              </div>

              {/* Status Transitions */}
              {currentStatus === 'NEW' && (
                <div className="space-y-3.5 bg-red-50/70 border border-red-200/80 rounded-2xl p-4.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-extrabold text-red-900">Unacknowledged Breach Detected</h4>
                      <p className="text-[12.5px] text-red-700 mt-0.5 leading-relaxed">
                        This environmental breach has been flagged by the IoT monitoring network and requires formal officer review.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition(incident, 'ACKNOWLEDGED')}
                    className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[14px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Acknowledge Incident</span>
                  </button>
                </div>
              )}

              {currentStatus === 'ACKNOWLEDGED' && (
                <div className="space-y-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4.5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-extrabold text-amber-900">Incident Acknowledged</h4>
                      <p className="text-[12.5px] text-amber-700 mt-0.5 leading-relaxed">
                        The incident has been acknowledged. Dispatch field inspection teams or begin telemetry investigation.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition(incident, 'UNDER INVESTIGATION')}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    <span>Start Investigation</span>
                  </button>
                </div>
              )}

              {currentStatus === 'UNDER INVESTIGATION' && (
                <div className="space-y-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4.5">
                  <div className="flex items-start gap-2.5">
                    <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-extrabold text-blue-900">Active Field Investigation</h4>
                      <p className="text-[12.5px] text-blue-700 mt-0.5 leading-relaxed">
                        Environmental teams are actively investigating the breach source. Once remediation is verified, resolve the incident.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition(incident, 'RESOLVED')}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Resolve Incident</span>
                  </button>
                </div>
              )}

              {currentStatus === 'RESOLVED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-[14px] font-extrabold">✓ Incident Resolved</h4>
                    <p className="text-[12.5px] text-emerald-700 mt-0.5">This environmental incident has been fully audited and resolved.</p>
                  </div>
                </div>
              )}

            </div>

            {/* REAL ACTIVITY / AUDIT RESPONSE LOG */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-[17px] font-extrabold text-slate-900">Audit & Response History</h3>
              </div>

              {logs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[12.5px] font-medium">
                  <p>• {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '00:00'} — Incident detected and logged in database.</p>
                  <p className="mt-1 text-slate-400">• Current state: {currentStatus}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, idx) => (
                    <div key={log._id || idx} className="p-3 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold text-slate-800">{log.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US') : (log.createdAt ? new Date(log.createdAt).toLocaleString('en-US') : 'Logged')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default IncidentResponse;
