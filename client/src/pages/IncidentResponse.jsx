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
  Flame,
  CloudFog,
  UserCheck,
  UserPlus,
  Send,
  Save,
  Upload,
  Image as ImageIcon,
  Check,
  Info,
  ChevronRight,
  Search
} from 'lucide-react';
import api from '../services/api';
import getSocket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { getEvidenceImageUrl } from '../utils/imageUrl';
import { generateEvidencePDF, downloadEvidenceImage } from '../utils/evidenceActions';
import NotificationDropdown from '../components/NotificationDropdown';

// Custom Incident Pin Marker
const createLocationPin = (label, status, dept) => {
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
  const { user } = useAuth();

  const isAuthority = user?.role === 'authority';
  const isFireOfficer = user?.role === 'fire_officer';
  const isPollutionOfficer = user?.role === 'pollution_officer';
  const isOfficer = isFireOfficer || isPollutionOfficer;
  const isAdmin = user?.role === 'admin';

  // Base path for navigation
  const basePath = useMemo(() => {
    if (isFireOfficer) return '/fire';
    if (isPollutionOfficer) return '/pollution';
    if (isAuthority) return '/authority';
    return '/admin';
  }, [isFireOfficer, isPollutionOfficer, isAuthority]);

  // Back Navigation Path
  const backPath = useMemo(() => {
    if (isFireOfficer) return '/fire/incidents';
    if (isPollutionOfficer) return '/pollution/incidents';
    if (isAuthority) return '/authority/incidents';
    return '/admin/evidence';
  }, [isFireOfficer, isPollutionOfficer, isAuthority]);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // List View State (when no incidentId in URL)
  const [incidentList, setIncidentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Single Incident Detail State (when incidentId is provided)
  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Available Officers State (for Authority Assignment)
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(false);

  // Authority Assignment Form
  const [selectedDept, setSelectedDept] = useState('fire_officer'); // 'fire_officer' | 'pollution_officer'
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Field Officer Workflow State
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Fetch Data: Either Single Incident (Detail View) or All Incidents (Registry View)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (incidentId) {
        // Fetch Single Incident & Logs
        const [evidenceRes, logsRes] = await Promise.allSettled([
          api.get(`/evidence/${incidentId}`),
          api.get('/activity-logs')
        ]);

        if (evidenceRes.status === 'fulfilled' && evidenceRes.value.data) {
          const item = evidenceRes.value.data;
          setIncident(item);
          setInvestigationNotes(item.investigationNotes || '');
          setResolutionNotes(item.resolutionNotes || '');
          setResolutionImageUrl(item.resolutionImageUrl || '');
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
        // Fetch Incidents for Registry View
        const { data } = await api.get('/evidence');
        if (Array.isArray(data)) {
          let list = data;
          if (isFireOfficer) {
            list = data.filter(i => i.assignedDepartment === 'FIRE_OFFICER' || i.assignedOfficerRole === 'fire_officer');
          } else if (isPollutionOfficer) {
            list = data.filter(i => i.assignedDepartment === 'POLLUTION_OFFICER' || i.assignedOfficerRole === 'pollution_officer');
          }
          const sorted = [...list].sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
          setIncidentList(sorted);
        }
      }
    } catch (err) {
      console.error('Error fetching incident data:', err);
      setError(err.response?.data?.message || 'Failed to load incident records.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch Officers for Authority Assignment Dropdown
  const fetchOfficersForAssignment = useCallback(async (role) => {
    setOfficersLoading(true);
    try {
      const { data } = await api.get(`/auth/officers?role=${role}`);
      if (data && data.success) {
        setAvailableOfficers(data.users || []);
        if (data.users && data.users.length > 0) {
          setSelectedOfficerId(data.users[0]._id);
        } else {
          setSelectedOfficerId('');
        }
      }
    } catch (err) {
      console.error('Error loading officers:', err);
    } finally {
      setOfficersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (incidentId && (isAuthority || isAdmin)) {
      fetchOfficersForAssignment(selectedDept);
    }
  }, [incidentId, isAuthority, isAdmin, selectedDept, fetchOfficersForAssignment]);

  // Realtime Socket.io listener
  useEffect(() => {
    const socket = getSocket();

    const handleIncidentCaptured = (newEvt) => {
      setIncidentList(prev => [newEvt, ...prev]);
    };

    const handleStatusUpdated = (data) => {
      // Update in registry list
      setIncidentList(prev => prev.map(inc => {
        if (inc.evidenceId === data.evidenceId || inc._id === data._id) {
          return { ...inc, ...data };
        }
        return inc;
      }));

      // Update in detail view
      if (incidentId && (data.evidenceId === incidentId || data._id === incidentId)) {
        setIncident(prev => prev ? { ...prev, ...data } : prev);
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

    socket.on('evidence-captured', handleIncidentCaptured);
    socket.on('incident-assigned', handleStatusUpdated);
    socket.on('incident-status-updated', handleStatusUpdated);

    return () => {
      socket.off('evidence-captured', handleIncidentCaptured);
      socket.off('incident-assigned', handleStatusUpdated);
      socket.off('incident-status-updated', handleStatusUpdated);
    };
  }, [incidentId]);

  // Authority assigns incident
  const handleAssignIncident = async (e) => {
    e.preventDefault();
    if (!incident) return;

    setAssignLoading(true);
    setActionFeedback({ type: '', message: '' });

    const chosenOfficer = availableOfficers.find(o => o._id === selectedOfficerId);
    const chosenName = chosenOfficer ? chosenOfficer.fullName : (selectedDept === 'fire_officer' ? 'Fire Officer 01' : 'Pollution Officer 01');

    try {
      const targetId = incident._id || incident.evidenceId;
      const { data } = await api.post(`/evidence/${targetId}/assign`, {
        officerType: selectedDept,
        officerId: selectedOfficerId || null,
        officerName: chosenName,
        notes: assignmentNotes.trim()
      });

      if (data && data.success) {
        setIncident(data.data);
        setActionFeedback({ 
          type: 'success', 
          message: `✓ Incident successfully assigned to ${selectedDept === 'fire_officer' ? '🔥 Fire Officer' : '🌫️ Pollution Officer'} (${chosenName})` 
        });
        setAssignmentNotes('');
      } else {
        setActionFeedback({ type: 'error', message: data?.message || 'Failed to assign incident.' });
      }
    } catch (err) {
      console.error('Assignment error:', err);
      setActionFeedback({ type: 'error', message: err.response?.data?.message || 'Server error during assignment.' });
    } finally {
      setAssignLoading(false);
    }
  };

  // Field Officer Status Progression
  const handleOfficerStatusTransition = async (nextStatus) => {
    if (!incident) return;
    setActionLoading(true);
    setActionFeedback({ type: '', message: '' });

    try {
      const targetId = incident._id || incident.evidenceId;
      const payload = {
        nextStatus,
        notes: investigationNotes.trim()
      };

      if (nextStatus === 'RESOLVED') {
        payload.resolutionNotes = resolutionNotes.trim();
        payload.resolutionImageUrl = resolutionImageUrl.trim();
      }

      const { data } = await api.put(`/evidence/${targetId}/incident-status`, payload);

      if (data && data.success) {
        setIncident(data.data);
        setActionFeedback({ type: 'success', message: `✓ Incident status advanced to ${nextStatus}` });
      } else {
        setActionFeedback({ type: 'error', message: data?.message || 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Status error:', err);
      setActionFeedback({ type: 'error', message: err.response?.data?.message || 'Server error updating status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!incident) return;
    setNotesSaving(true);
    try {
      const targetId = incident._id || incident.evidenceId;
      const { data } = await api.put(`/evidence/${targetId}/notes`, { notes: investigationNotes });
      if (data && data.success) {
        setIncident(data.data);
        setActionFeedback({ type: 'success', message: '✓ Investigation notes saved.' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: 'Failed to save notes.' });
    } finally {
      setNotesSaving(false);
    }
  };

  // PDF & Download Actions
  const handleGeneratePDF = async () => {
    if (!incident) return;
    setPdfGenerating(true);
    try {
      await generateEvidencePDF(incident);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!incident || !incident.imageUrl) return;
    downloadEvidenceImage(incident.imageUrl, incident.evidenceId);
  };

  // Coordinates validation for detail view
  const hasValidCoordinates = useMemo(() => {
    return incident && 
      typeof incident.latitude === 'number' && 
      typeof incident.longitude === 'number' && 
      incident.latitude !== 0 && 
      incident.longitude !== 0 && 
      !isNaN(incident.latitude) && 
      !isNaN(incident.longitude);
  }, [incident]);

  // KPI Calculations for Registry List View
  const listMetrics = useMemo(() => {
    const total = incidentList.length;
    const newCount = incidentList.filter(i => (i.incidentStatus || 'NEW') === 'NEW').length;
    const assignedCount = incidentList.filter(i => i.incidentStatus === 'ASSIGNED' || i.incidentStatus === 'ACKNOWLEDGED').length;
    const investigating = incidentList.filter(i => i.incidentStatus === 'UNDER INVESTIGATION').length;
    const resolved = incidentList.filter(i => i.incidentStatus === 'RESOLVED').length;
    return { total, newCount, assignedCount, investigating, resolved };
  }, [incidentList]);

  // Filtered List for Registry List View
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidentList.filter(item => {
      const matchQ = !q || 
        (item.evidenceId || '').toLowerCase().includes(q) ||
        (item.locationName || item.location || '').toLowerCase().includes(q) ||
        (item.sensorId || '').toLowerCase().includes(q);

      const st = item.incidentStatus || 'NEW';
      const matchStatus = statusFilter === 'All' || st === statusFilter;

      return matchQ && matchStatus;
    });
  }, [incidentList, searchQuery, statusFilter]);

  const getStatusBadge = (st) => {
    switch(st) {
      case 'ASSIGNED': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'ACKNOWLEDGED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER INVESTIGATION': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // =========================================================================
  // VIEW 1: REGISTRY LIST VIEW (Rendered when URL is /authority/incidents, /fire/incidents, /pollution/incidents)
  // =========================================================================
  if (!incidentId) {
    return (
      <div className="flex flex-col min-h-full w-full font-sans pb-20 bg-[#F8FBFF]">
        
        {/* Header - Unified Admin/Authority Design */}
        <div className="bg-white border-b border-[#DCEEFF] px-4 sm:px-8 py-5">
          <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border bg-blue-50 border-blue-200 text-blue-700">
                  {isFireOfficer ? 'Fire Response Portal' : (isPollutionOfficer ? 'Pollution Control Portal' : 'Authority Control')}
                </span>
                <span className="text-[12px] font-bold text-slate-500">
                  {isOfficer ? `Officer ${user?.fullName || 'Assigned'}` : 'Official Incident Registry'}
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-black text-slate-900 mt-1 tracking-tight">
                {isFireOfficer ? 'Assigned Fire Incidents' : (isPollutionOfficer ? 'Assigned Pollution Incidents' : 'Incident Response & Assignment')}
              </h1>
              <p className="text-[13.5px] text-slate-500 mt-0.5">
                {isOfficer 
                  ? 'Acknowledge dispatches, update field investigation notes, and attach verified remediation closure proof.'
                  : 'Review environmental breach alerts, assign cases to Fire or Pollution Officers, and monitor operational resolution.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-slate-700 hover:text-blue-600 hover:bg-[#F0F7FF] transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Incidents</span>
              </button>
              <NotificationDropdown />
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 flex-1">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Total Captured</p>
                <h3 className="text-[26px] font-black text-slate-900 mt-0.5">{listMetrics.total}</h3>
                <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Department queue</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Pending Assignment</p>
                <h3 className="text-[26px] font-black text-amber-600 mt-0.5">{listMetrics.newCount}</h3>
                <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Awaiting triage</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Active Investigations</p>
                <h3 className="text-[26px] font-black text-blue-600 mt-0.5">{listMetrics.investigating + listMetrics.assignedCount}</h3>
                <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Field units deployed</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Resolved Incidents</p>
                <h3 className="text-[26px] font-black text-emerald-600 mt-0.5">{listMetrics.resolved}</h3>
                <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Remediation complete</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#DCEEFF] rounded-[22px] p-4.5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search incidents by ID, node, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13.5px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
              {['All', 'NEW', 'ASSIGNED', 'ACKNOWLEDGED', 'UNDER INVESTIGATION', 'RESOLVED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab 
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'All' ? 'All Incidents' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Registry List */}
          <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E2F0FF] flex items-center justify-between bg-white">
              <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Incident Registry & Action Feed
              </h3>
              <span className="text-[12.5px] font-bold text-slate-500">
                Showing {filteredList.length} of {incidentList.length} Records
              </span>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-[14px] font-bold text-slate-700">Loading incident registry...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="text-[16px] font-extrabold text-slate-800">No Incidents Found</h4>
                <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
                  No incidents match your current search criteria or status filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const resolvedImage = getEvidenceImageUrl(item.imageUrl);
                  const currentSt = item.incidentStatus || 'NEW';
                  const formattedTime = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  }) : 'N/A';

                  const isFire = item.assignedDepartment === 'FIRE_OFFICER' || item.assignedOfficerRole === 'fire_officer';

                  return (
                    <div
                      key={item.evidenceId || item._id}
                      className="p-5 hover:bg-[#F8FBFF] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                    >
                      {/* Left: Thumbnail & Telemetry */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-20 h-20 rounded-2xl bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
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
                            <span className="text-[16px] font-black text-slate-900 font-mono">
                              {item.evidenceId}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(currentSt)}`}>
                              {currentSt}
                            </span>
                            <span className="text-[11.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.detectionType || 'Threshold Exceeded'}
                            </span>
                            {item.assignedDepartment && (
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                                isFire ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {isFire ? '🔥 Fire Officer' : '🌫️ Pollution Officer'}
                                {item.assignedOfficerName ? ` — ${item.assignedOfficerName}` : ''}
                              </span>
                            )}
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

                      {/* Right: Action */}
                      <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
                        <Link
                          to={`${basePath}/incidents/${item.evidenceId || item._id}`}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md transition-all cursor-pointer bg-blue-600 hover:bg-blue-700"
                        >
                          <span>View & Respond</span>
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
  }

  // =========================================================================
  // VIEW 2: SINGLE INCIDENT DETAIL VIEW (Rendered when URL has :incidentId)
  // =========================================================================
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FBFF] p-6 text-center font-sans">
        <RefreshCw className="w-9 h-9 animate-spin text-blue-600 mb-3" />
        <h3 className="text-[17px] font-extrabold text-slate-800">Loading Incident Response...</h3>
        <p className="text-[13px] text-slate-500 mt-1">Retrieving evidence telemetry, location snapshot, and officer assignment</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FBFF] p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-[18px] font-extrabold text-slate-900">{error || 'Incident Not Found'}</h3>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[13.5px] shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const currentStatus = incident.incidentStatus || 'NEW';
  const resolvedImageUrl = getEvidenceImageUrl(incident.imageUrl);
  const resolutionImgUrl = getEvidenceImageUrl(incident.resolutionImageUrl);

  const isAssignedToFire = incident.assignedDepartment === 'FIRE_OFFICER' || incident.assignedOfficerRole === 'fire_officer';
  const isAssignedToPollution = incident.assignedDepartment === 'POLLUTION_OFFICER' || incident.assignedOfficerRole === 'pollution_officer';

  return (
    <div className="flex flex-col min-h-full w-full font-sans pb-24 bg-[#F8FBFF]">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#DCEEFF] px-4 sm:px-8 py-5">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link
              to={backPath}
              className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border bg-blue-50 border-blue-200 text-blue-700">
                  Incident Response
                </span>
                
                {incident.assignedDepartment && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${
                    isAssignedToFire ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isAssignedToFire ? <Flame className="w-3 h-3" /> : <CloudFog className="w-3 h-3" />}
                    <span>{isAssignedToFire ? 'Fire Dept' : 'Pollution Control'}</span>
                  </span>
                )}

                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                  currentStatus === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  currentStatus === 'UNDER INVESTIGATION' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  currentStatus === 'ACKNOWLEDGED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  currentStatus === 'ASSIGNED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-600 border-red-200 animate-pulse'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 mt-1 tracking-tight font-mono">
                {incident.evidenceId}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={pdfGenerating}
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCEEFF] rounded-xl text-[13px] font-bold text-slate-700 hover:text-blue-600 hover:bg-[#F0F7FF] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {pdfGenerating ? <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> : <FileText className="w-4 h-4 text-slate-600" />}
              <span>Official PDF Report</span>
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 bg-white border border-[#DCEEFF] rounded-xl text-slate-600 hover:text-blue-600 hover:bg-[#F0F7FF] transition-colors shadow-xs cursor-pointer"
              title="Refresh Record"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <NotificationDropdown />
          </div>

        </div>
      </div>

      {/* Main Content Area */}
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
            
            {/* ORIGINAL EVIDENCE IMAGE */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-extrabold text-slate-900">Original Captured Evidence</h3>
                </div>
                {resolvedImageUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                )}
              </div>

              <div className="w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[280px] max-h-[420px] border border-slate-200 relative">
                {resolvedImageUrl ? (
                  <img 
                    src={resolvedImageUrl} 
                    alt={incident.evidenceId}
                    className="w-full h-full max-h-[420px] object-contain"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-[14px] font-bold">Evidence image unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* IMMUTABLE HISTORICAL LOCATION SNAPSHOT */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-extrabold text-slate-900">Incident Location Snapshot</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Historical Coordinates
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Captured Station Location</p>
                  <p className="text-[15px] font-extrabold text-slate-900 mt-0.5">
                    {incident.locationName || incident.location || 'Location Not Configured'}
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono text-[13px] text-slate-600">
                  <p>Lat: <span className="font-bold text-slate-900">{typeof incident.latitude === 'number' && incident.latitude !== 0 ? incident.latitude.toFixed(6) : 'N/A'}</span></p>
                  <p>Lng: <span className="font-bold text-slate-900">{typeof incident.longitude === 'number' && incident.longitude !== 0 ? incident.longitude.toFixed(6) : 'N/A'}</span></p>
                </div>
              </div>

              <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-[#DCEEFF] relative">
                {hasValidCoordinates ? (
                  <MapContainer
                    center={[incident.latitude, incident.longitude]}
                    zoom={16}
                    className="w-full h-full z-0"
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap'
                    />
                    <Marker
                      position={[incident.latitude, incident.longitude]}
                      icon={createLocationPin(incident.evidenceId, currentStatus, incident.assignedDepartment)}
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
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Telemetry + Response Panel + Audit Log */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* SENSOR TELEMETRY GRID */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-[17px] font-extrabold text-slate-900">Sensor Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Detection Type</p>
                  <p className="text-[14px] font-extrabold text-slate-900 mt-0.5 truncate">{incident.detectionType || 'Threshold Exceeded'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Sensor Voltage</p>
                  <p className="text-[15px] font-bold text-red-600 font-mono mt-0.5">
                    {incident.voltage !== undefined ? `${Number(incident.voltage).toFixed(3)} V` : 'N/A'}{' '}
                    <span className="text-[11px] text-slate-400 font-sans">(Limit: 0.500V)</span>
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Reporting Node</p>
                  <p className="text-[13.5px] font-bold text-slate-800 font-mono mt-0.5 truncate">{incident.sensorId || 'ESP32-CAM-001'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Capture Time</p>
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT STATUS DETAILS */}
            {incident.assignedDepartment && (
              <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-3">
                <h4 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Assigned Response Officer
                </h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[13px]">
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-medium">Assigned Officer:</span>
                    <span className="font-extrabold text-slate-900">{incident.assignedOfficerName || 'Assigned Officer'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-medium">Officer Department:</span>
                    <span className={`font-bold ${isAssignedToFire ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isAssignedToFire ? '🔥 Fire Response Officer' : '🌫️ Pollution Control Officer'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-medium">Assigned By:</span>
                    <span className="font-bold text-slate-800">{incident.assignedByName || 'Authority Officer'}</span>
                  </p>
                  <p className="flex justify-between text-slate-400 text-[11.5px] pt-1 border-t border-slate-200">
                    <span>Assigned At:</span>
                    <span className="font-mono">{incident.assignedAt ? new Date(incident.assignedAt).toLocaleString('en-US') : 'Recent'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* AUTHORITY ASSIGNMENT PANEL */}
            {(isAuthority || isAdmin) && currentStatus === 'NEW' && (
              <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4 bg-blue-50/10">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[17px] font-black text-slate-900">Assign Incident</h3>
                </div>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  Review the breach evidence and dispatch this incident to the specialized field response category.
                </p>

                <form onSubmit={handleAssignIncident} className="space-y-4">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      1. Select Officer Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDept('fire_officer')}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          selectedDept === 'fire_officer' 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[16px]">🔥 Fire Officer</span>
                        <span className="text-[10.5px] font-medium text-slate-500">Fire, smoke, and heat breaches</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDept('pollution_officer')}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          selectedDept === 'pollution_officer' 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[16px]">🌫️ Pollution Officer</span>
                        <span className="text-[10.5px] font-medium text-slate-500">Gas, AQI, and chemical emissions</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      2. Available Field Officers *
                    </label>
                    {officersLoading ? (
                      <div className="p-2 text-[12px] text-slate-400">Loading officers...</div>
                    ) : availableOfficers.length === 0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[12px] rounded-xl font-medium">
                        No active officers registered under this category. (Will assign to general queue).
                      </div>
                    ) : (
                      <select
                        value={selectedOfficerId}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13.5px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableOfficers.map(off => (
                          <option key={off._id} value={off._id}>
                            {off.fullName} ({off.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      3. Assignment Directives & Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. High priority threshold breach at North Station. Immediate inspection requested."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {assignLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Assign Incident</span>
                  </button>
                </form>
              </div>
            )}

            {/* Read-Only Status for Authority */}
            {(isAuthority) && currentStatus !== 'NEW' && (
              <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-[15px] font-extrabold">Authority Coordination Status</h4>
                </div>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  ✓ This incident has been assigned. The assigned field response officer is currently handling operational investigation and final resolution.
                </p>
              </div>
            )}

            {/* FIELD OFFICER OPERATIONAL RESPONSE PANEL */}
            {(isOfficer || isAdmin) && (
              <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-[17px] font-black text-slate-900">Officer Response Actions</h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                    currentStatus === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {currentStatus}
                  </span>
                </div>

                {/* 1. Investigation Notes Editor */}
                <div className="space-y-2">
                  <label className="block text-[11.5px] font-bold text-slate-600 uppercase tracking-wider">
                    Field Investigation Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter on-site telemetry observations, root cause analysis, or team directives..."
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    disabled={currentStatus === 'RESOLVED'}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-60"
                  />
                  {currentStatus !== 'RESOLVED' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={notesSaving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] rounded-lg transition-colors cursor-pointer"
                      >
                        {notesSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Notes</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Operational Status Actions */}
                {currentStatus === 'ASSIGNED' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <p className="text-[12.5px] font-semibold text-amber-900">
                      Step 1: Acknowledge assignment to confirm dispatch and team readiness.
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleOfficerStatusTransition('ACKNOWLEDGED')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Acknowledge Incident</span>
                    </button>
                  </div>
                )}

                {currentStatus === 'ACKNOWLEDGED' && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                    <p className="text-[12.5px] font-semibold text-blue-900">
                      Step 2: Commence field inspection and sensor telemetry investigation.
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleOfficerStatusTransition('UNDER INVESTIGATION')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      <span>Start Field Investigation</span>
                    </button>
                  </div>
                )}

                {currentStatus === 'UNDER INVESTIGATION' && (
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
                    <p className="text-[12.5px] font-semibold text-purple-900">
                      Step 3: Verification & Closure. Enter final resolution summary notes and resolve the incident.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Resolution Summary Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Emission valve secured, smoke extinguished, levels normalized."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      onClick={() => handleOfficerStatusTransition('RESOLVED')}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[14px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Mark Incident RESOLVED</span>
                    </button>
                  </div>
                )}

                {currentStatus === 'RESOLVED' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2 text-emerald-900">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="text-[14.5px] font-black">✓ Incident Fully Resolved</h4>
                    </div>
                    {incident.resolutionNotes && (
                      <div className="p-3 bg-white border border-emerald-200 rounded-xl text-[13px] text-slate-700">
                        <p className="font-bold text-emerald-900 text-[11.5px] uppercase mb-0.5">Resolution Notes:</p>
                        <p>{incident.resolutionNotes}</p>
                      </div>
                    )}
                    <p className="text-[11.5px] text-emerald-700">
                      Remediation marked as RESOLVED by {incident.resolvedByName || 'Field Officer'}.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* AUDIT & RESPONSE HISTORY LOG */}
            <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-[17px] font-extrabold text-slate-900">Audit & Response History</h3>
              </div>

              {logs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[12.5px]">
                  <p>• Initial telemetry captured by IoT monitoring node.</p>
                  <p className="mt-1 text-slate-400">• Current state: {currentStatus}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, idx) => (
                    <div key={log._id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold text-slate-800">{log.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US') : 'Recorded'}
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
