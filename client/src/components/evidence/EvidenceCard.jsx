import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, FileText, Trash2, MapPin, Clock, Cloud, CheckCircle } from 'lucide-react';

const EvidenceCard = ({ evidence, onView, onDelete }) => {
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

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-[24px] overflow-hidden border border-[#DCEEFF] shadow-sm group flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
        <img 
          src={evidence.imageUrl} 
          alt={evidence.detectionType} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20">
            {evidence.detectionType}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {evidence.cloudinaryPublicId && (
            <div className="w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm" title="Cloud Uploaded">
              <Cloud className="w-4 h-4 text-blue-500" />
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
              <MapPin className="w-3 h-3 text-blue-500" /> {evidence.location}
            </p>
          </div>
          <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(evidence.status)}`}>
            {evidence.status}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">AQI</p>
            <p className={`text-[15px] font-bold ${evidence.aqi > 150 ? 'text-red-500' : 'text-emerald-500'}`}>
              {evidence.aqi}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">AI Confidence</p>
            <p className="text-[15px] font-bold text-blue-500">{evidence.confidence}%</p>
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
          
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200" title="Download Image">
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
