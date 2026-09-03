import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setIsOpen(false);

    if (n.evidenceId) {
      if (user?.role === 'fire_officer') {
        navigate(`/fire/incidents/${n.evidenceId}`);
      } else if (user?.role === 'pollution_officer') {
        navigate(`/pollution/incidents/${n.evidenceId}`);
      } else if (user?.role === 'authority') {
        navigate(`/authority/incidents/${n.evidenceId}`);
      } else {
        navigate('/admin/evidence');
      }
    }
  };

  const getNotifIcon = (type, severity) => {
    if (type === 'breach' || severity === 'critical') {
      return <ShieldAlert className="w-4 h-4 text-red-600" />;
    }
    if (severity === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'alert' || severity === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
    return <Bell className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2.5 bg-white border border-[#DCEEFF] rounded-xl text-[#64748B] hover:text-[#3B82F6] hover:bg-[#F0F7FF] shadow-xs hover:shadow-sm transition-all group cursor-pointer flex items-center justify-center"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-red-600 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#DCEEFF] overflow-hidden z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h4 className="text-[13.5px] font-extrabold text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Clear All"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Items List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-[13px] font-bold text-slate-600">No Notifications</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Alerts and status updates will appear in real time.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-[#F8FBFF] transition-colors flex items-start gap-3 cursor-pointer ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      {getNotifIcon(n.type, n.severity)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[12.5px] font-bold text-slate-900 truncate">{n.title}</p>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug break-words">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {n.timestamp ? new Date(n.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-medium">Realtime Socket.io active</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
