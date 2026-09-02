import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, FileText, Trash2, MapPin, Clock, Cloud, Camera, AlertCircle } from 'lucide-react';
import { getEvidenceImageUrl } from '../../utils/imageUrl';

const EvidenceCard = ({ evidence, onView, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'Report Generated': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formattedDate = new Date(evidence.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  const formattedTime = new Date(evidence.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const resolvedImageUrl = getEvidenceImageUrl(evidence.imageUrl);

  const handleDownloadImage = (e) => {
    e.stopPropagation();
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
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-[24px] overflow-hidden border border-[#DCEEFF] shadow-sm group flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
        {!imageError && resolvedImageUrl ? (
          <img 
            src={resolvedImageUrl} 
            alt={evidence.detectionType || 'Evidence Capture'} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-1 text-slate-400">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">
              {imageError ? 'Image Unavailable' : 'No Image'}
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20">
            {evidence.detectionType || 'Evidence'}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-10">
          {evidence.cloudinaryPublicId ? (
            <div className="w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm" title="Cloud Uploaded">
              <Cloud className="w-4 h-4 text-blue-500" />
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-slate-950/70 backdrop-blur-md text-emerald-400 text-[9px] font-mono font-bold rounded-md border border-white/10" title="ESP32-CAM Storage">
              LOCAL
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-slate-800 text-[15px]">{evidence.evidenceId}</h4>
            <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-blue-500" /> {evidence.location || 'ESP32 Station'}
            </p>
          </div>
          <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(evidence.status)}`}>
            {evidence.status}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Voltage / AQI</p>
            <p className={`text-[15px] font-bold ${evidence.voltage !== undefined && evidence.voltage >= 0.5 ? 'text-red-500' : 'text-emerald-500'} font-mono`}>
              {evidence.voltage !== undefined ? `${Number(evidence.voltage).toFixed(3)} V` : evidence.aqi}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Confidence</p>
            <p className="text-[15px] font-bold text-blue-500">{evidence.confidence || 95}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mb-5 mt-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          <button 
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-[13px] font-bold hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" /> View
          </button>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200" title="Generate PDF">
            <FileText className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleDownloadImage}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200" 
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100 ml-auto" title="Delete Evidence"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EvidenceCard;
