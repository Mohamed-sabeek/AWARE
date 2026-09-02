import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Target, Activity, Camera, Cpu, Cloud, FileText, Mail, Download, Share2, AlertCircle } from 'lucide-react';
import { getEvidenceImageUrl } from '../../utils/imageUrl';

const EvidenceDrawer = ({ isOpen, onClose, evidence }) => {
  const [imgError, setImgError] = useState(false);

  if (!evidence) return null;

  const formattedDate = new Date(evidence.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  
  const formattedTime = new Date(evidence.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  const resolvedImageUrl = getEvidenceImageUrl(evidence.imageUrl);

  const handleSaveImage = () => {
    if (!resolvedImageUrl) return;
    const link = document.createElement('a');
    link.href = resolvedImageUrl;
    link.download = `${evidence.evidenceId || 'evidence'}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-[60] flex flex-col border-l border-[#DCEEFF] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{evidence.evidenceId}</h2>
                <p className="text-[13px] text-slate-500 font-medium">Digital Evidence Record</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Image Preview */}
              <div className="w-full bg-slate-900 relative group flex items-center justify-center min-h-[260px]">
                {!imgError && resolvedImageUrl ? (
                  <img 
                    src={resolvedImageUrl} 
                    alt={evidence.detectionType || 'Evidence Preview'} 
                    className="w-full object-contain max-h-[350px]"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">
                      {imgError ? 'Image Unavailable' : 'No Image Available'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 font-mono">
                      {evidence.imageUrl || 'No URL stored'}
                    </span>
                  </div>
                )}
                {resolvedImageUrl && !imgError && (
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleSaveImage}
                      className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[12px] font-bold text-slate-700 shadow-lg flex items-center gap-1.5 hover:bg-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Save Image
                    </button>
                  </div>
                )}
              </div>

              {/* Data Sections */}
              <div className="p-6 space-y-8">
                
                {/* AI Analysis */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> AI Analysis Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[12px] font-medium text-slate-500 mb-1">Detection Signature</p>
                      <p className="text-[16px] font-bold text-slate-900">{evidence.detectionType || 'Incident'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[12px] font-medium text-slate-500 mb-1">AI Confidence</p>
                      <p className="text-[16px] font-bold text-blue-500">{evidence.confidence || 95}%</p>
                    </div>
                  </div>
                </section>

                {/* Environmental Data */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Environmental Context
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 mb-1">Sensor Voltage / AQI</p>
                      <p className={`text-[20px] font-bold ${evidence.voltage !== undefined && evidence.voltage >= 0.5 ? 'text-red-500' : 'text-emerald-500'} font-mono`}>
                        {evidence.voltage !== undefined ? `${Number(evidence.voltage).toFixed(3)} V` : evidence.aqi}{' '}
                        <span className="text-[12px] font-medium text-slate-500 ml-1 font-sans">
                          {evidence.voltage !== undefined ? '(Threshold: 0.500 V)' : 'US EPA'}
                        </span>
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${evidence.voltage !== undefined && evidence.voltage >= 0.5 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'} flex items-center justify-center border-4 border-white shadow-sm`}>
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                </section>

                {/* Hardware & Location */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Source Metadata
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <p className="text-[13px] font-semibold text-slate-800">{evidence.location || 'ESP32 Station'}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">Lat: {evidence.latitude || 0} • Lng: {evidence.longitude || 0}</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Capture Node</p>
                        <p className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-blue-500" /> {evidence.cameraId || 'ESP32-CAM-001'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Sensor Array</p>
                        <p className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-emerald-500" /> {evidence.sensorId || 'ESP32-CAM-001'}
                        </p>
                      </div>
                      <div className="col-span-2 mt-2">
                         <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Timestamp</p>
                         <p className="text-[13px] font-semibold text-slate-700">{formattedDate} at {formattedTime}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* System Status */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5" /> Verification & Sync
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Cloud className={`w-4 h-4 ${evidence.cloudinaryPublicId ? 'text-blue-500' : 'text-emerald-500'}`} />
                        <span className="text-[13px] font-semibold text-slate-700">Storage Destination</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-500 uppercase">{evidence.cloudinaryPublicId ? 'Cloudinary' : 'Local Storage'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 ${evidence.reportStatus !== 'Not Generated' ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="text-[13px] font-semibold text-slate-700">Official Report</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-500 uppercase">{evidence.reportStatus || 'Pending'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Mail className={`w-4 h-4 ${evidence.emailStatus === 'Sent' ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="text-[13px] font-semibold text-slate-700">Authorities Notified</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-500 uppercase">{evidence.emailStatus || 'Not Sent'}</span>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-[14px] font-bold hover:bg-slate-100 transition-colors shadow-sm">
                <FileText className="w-4 h-4" /> Generate PDF
              </button>
              <button 
                onClick={handleSaveImage}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                <Share2 className="w-4 h-4" /> Download / Share
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EvidenceDrawer;
