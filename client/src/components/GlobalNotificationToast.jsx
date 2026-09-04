import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, AlertTriangle, Bell, X, ArrowRight, Video } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const GlobalNotificationToast = () => {
  const { toastAlert, setToastAlert, markAsRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert, setToastAlert]);

  // Do not render toast notifications if user is not authenticated or there is no alert
  if (!user || !toastAlert) return null;

  const handleClick = () => {
    if (toastAlert.id) {
      markAsRead(toastAlert.id);
    }
    setToastAlert(null);

    if (toastAlert.evidenceId) {
      if (user?.role === 'fire_officer') {
        navigate(`/fire/incidents/${toastAlert.evidenceId}`);
      } else if (user?.role === 'pollution_officer') {
        navigate(`/pollution/incidents/${toastAlert.evidenceId}`);
      } else if (user?.role === 'authority') {
        navigate(`/authority/incidents/${toastAlert.evidenceId}`);
      } else {
        navigate('/admin/evidence');
      }
    }
  };

  const getIcon = () => {
    if (toastAlert.type === 'breach' || toastAlert.severity === 'critical') {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    if (toastAlert.severity === 'success' || toastAlert.incidentStatus === 'RESOLVED') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      );
    }
    if (toastAlert.type === 'assigned') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bell className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] pointer-events-auto max-w-sm w-full font-sans">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white/95 backdrop-blur-xl border border-[#DCEEFF] rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)] p-4 flex items-start gap-3.5 relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            toastAlert.severity === 'critical' ? 'bg-red-500' :
            toastAlert.severity === 'success' ? 'bg-emerald-500' :
            'bg-blue-600'
          }`} />

          {getIcon()}

          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-[14px] font-extrabold text-slate-900 leading-tight">
              {toastAlert.title}
            </h4>
            <p className="text-[12px] text-slate-600 mt-1 leading-snug break-words">
              {toastAlert.message}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              {toastAlert.liveStreamUrl && (
                <a
                  href={toastAlert.liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setToastAlert(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[11.5px] font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>View Live Camera</span>
                </a>
              )}

              {toastAlert.evidenceId && (
                <button
                  type="button"
                  onClick={handleClick}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
                >
                  <span>Respond</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToastAlert(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalNotificationToast;
