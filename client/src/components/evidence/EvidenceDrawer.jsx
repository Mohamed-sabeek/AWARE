import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Target, 
  Activity, 
  Camera, 
  Cpu, 
  Cloud, 
  FileText, 
  Mail, 
  Download, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { getEvidenceImageUrl } from '../../utils/imageUrl';
import { generateEvidencePDF, downloadEvidenceImage, shareEvidence } from '../../utils/evidenceActions';

const EvidenceDrawer = ({ isOpen, onClose, evidence }) => {
  const [imgError, setImgError] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Reset states when opened with new evidence
  useEffect(() => {
    setImgError(false);
    setIsShareMenuOpen(false);
    setFeedback({ type: '', message: '' });
  }, [evidence?._id]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isShareMenuOpen) {
          setIsShareMenuOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isShareMenuOpen, onClose]);

  if (!evidence) return null;

  const formattedDate = evidence.createdAt ? new Date(evidence.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : 'Date not available';
  
  const formattedTime = evidence.createdAt ? new Date(evidence.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  }) : 'Time not available';

  const resolvedImageUrl = getEvidenceImageUrl(evidence.imageUrl);

  // PDF Generation Handler
  const handlePDFAction = async () => {
    setGeneratingPDF(true);
    setFeedback({ type: '', message: '' });
    try {
      await generateEvidencePDF(evidence);
      setFeedback({ type: 'success', message: 'PDF generated successfully.' });
      setIsShareMenuOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to generate PDF.' });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Image Download Handler
  const handleImageDownload = async () => {
    setDownloadingImage(true);
    setFeedback({ type: '', message: '' });
    try {
      await downloadEvidenceImage(evidence);
      setFeedback({ type: 'success', message: 'Image downloaded successfully.' });
      setIsShareMenuOpen(false);
    } catch (err) {
      console.error('Image download error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to download image.' });
    } finally {
      setDownloadingImage(false);
    }
  };

  // Share Handler
  const handleShareAction = async () => {
    setSharing(true);
    setFeedback({ type: '', message: '' });
    try {
      const result = await shareEvidence(evidence);
      if (result.success && !result.aborted) {
        setFeedback({ type: 'success', message: result.message || 'Shared successfully.' });
        setIsShareMenuOpen(false);
      }
    } catch (err) {
      console.error('Share action error:', err);
      setFeedback({ type: 'error', message: 'Sharing failed.' });
    } finally {
      setSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop (Solid alpha without expensive backdrop-blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/55"
          />

          {/* Drawer Panel (GPU Layered) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-10 flex flex-col border-l border-[#DCEEFF] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-[17px] font-extrabold text-slate-900 truncate tracking-tight">{evidence.evidenceId}</h2>
                <p className="text-[12px] text-slate-500 font-medium">Digital Evidence Record</p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Feedback Toast */}
            {feedback.message && (
              <div className={`px-5 py-2.5 text-[12.5px] font-bold border-b flex items-center gap-2 shrink-0 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Scrollable Content (Hardware-Accelerated Smooth Scrolling) */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain"
              style={{ 
                WebkitOverflowScrolling: 'touch', 
                contain: 'layout paint', 
                willChange: 'scroll-position' 
              }}
            >
              
              {/* Image Preview Container */}
              <div 
                className="w-full bg-slate-900 relative group flex items-center justify-center min-h-[260px] max-h-[340px] overflow-hidden"
                style={{ contain: 'paint' }}
              >
                {!imgError && resolvedImageUrl ? (
                  <img 
                    src={resolvedImageUrl} 
                    alt={evidence.detectionType || 'Evidence Preview'} 
                    className="w-full h-full max-h-[340px] object-contain"
                    decoding="async"
                    loading="eager"
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
                    <span className="text-xs text-slate-500 mt-1 font-mono max-w-[280px] truncate">
                      {evidence.imageUrl || 'No URL stored'}
                    </span>
                  </div>
                )}
              </div>

              {/* Data Sections */}
              <div className="p-6 space-y-6" style={{ contain: 'layout' }}>
                
                {/* AI Analysis */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-blue-500" /> AI Detection Signature
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Detection Type</p>
                      <p className="text-[14px] font-extrabold text-slate-900 truncate">{evidence.detectionType || 'Threshold Exceeded'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">AI Confidence</p>
                      <p className="text-[14px] font-extrabold text-blue-600 font-mono">{evidence.confidence ? `${evidence.confidence}%` : '95%'}</p>
                    </div>
                  </div>
                </section>

                {/* Environmental Data */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" /> Sensor Telemetry
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Sensor Voltage Reading</p>
                      <p className={`text-[20px] font-black ${evidence.voltage !== undefined && evidence.voltage >= 0.5 ? 'text-red-500' : 'text-emerald-600'} font-mono`}>
                        {evidence.voltage !== undefined && evidence.voltage !== null ? `${Number(evidence.voltage).toFixed(3)} V` : 'N/A'}{' '}
                        <span className="text-[12px] font-bold text-slate-400 font-sans ml-1">
                          (Threshold: 0.500 V)
                        </span>
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-full ${evidence.voltage !== undefined && evidence.voltage >= 0.5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center border border-white shadow-sm`}>
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                </section>

                {/* Hardware & Location (Snapshot) */}
                <section>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> Location Snapshot & Metadata
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <div className="p-3.5 border-b border-slate-100 bg-blue-50/40">
                      <p className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{evidence.locationName || evidence.location || 'Location not configured'}</span>
                      </p>
                      <p className="text-[12px] text-slate-500 mt-0.5 font-mono">
                        {evidence.latitude !== null && evidence.latitude !== undefined && evidence.longitude !== null && evidence.longitude !== undefined ? (
                          <span>Lat: {Number(evidence.latitude).toFixed(6)} • Lng: {Number(evidence.longitude).toFixed(6)}</span>
                        ) : (
                          <span className="italic text-slate-400">Coordinates not configured</span>
                        )}
                      </p>
                    </div>
                    <div className="p-3.5 grid grid-cols-2 gap-3 bg-white text-[12px]">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Capture Node</p>
                        <p className="font-mono font-bold text-slate-800 truncate flex items-center gap-1">
                          <Camera className="w-3 h-3 text-blue-500" /> {evidence.cameraId || 'ESP32-CAM-001'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Sensor Device</p>
                        <p className="font-mono font-bold text-slate-800 truncate flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-emerald-500" /> {evidence.sensorId || 'ESP32-CAM-001'}
                        </p>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Capture Time</p>
                         <p className="font-semibold text-slate-700">{formattedDate} at {formattedTime}</p>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex flex-col gap-2 relative">
              
              {/* Share & Download Menu Dropup */}
              <AnimatePresence>
                {isShareMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-[calc(100%+8px)] right-4 left-4 bg-white rounded-2xl shadow-xl border border-[#DCEEFF] p-2 flex flex-col gap-1 z-30 font-sans"
                  >
                    <button
                      type="button"
                      onClick={handleImageDownload}
                      disabled={downloadingImage}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <div>Download Evidence Image</div>
                        <div className="text-[11px] font-normal text-slate-400">Save original JPEG capture</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareAction}
                      disabled={sharing}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer border-t border-slate-100"
                    >
                      <Share2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <div>Share Evidence</div>
                        <div className="text-[11px] font-normal text-slate-400">Web Share or copy details</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Footer Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  disabled={generatingPDF}
                  onClick={handlePDFAction}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 text-slate-800 rounded-xl text-[13.5px] font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {generatingPDF ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-[13.5px] font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Download / Share</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isShareMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EvidenceDrawer;
