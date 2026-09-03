import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, CheckCircle2, ShieldAlert, AlertTriangle, X, ExternalLink, Check, Trash2 } from 'lucide-react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const PageHeader = ({ title, description, children }) => {
  const { isMobile, setIsSidebarOpen } = useOutletContext() || { isMobile: false, setIsSidebarOpen: () => {} };
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotifOpen]);

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setIsNotifOpen(false);

    if (n.evidenceId) {
      if (user?.role === 'authority') {
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
    if (type === 'status' && severity === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'alert' || severity === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
    return <Bell className="w-4 h-4 text-blue-600" />;
  };

  return (
    <header 
      className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-6 lg:px-10 h-24 bg-white/95 backdrop-blur-xl border-b border-[#DCEEFF] w-full font-sans"
    >
      {/* LEFT SECTION: Title, Description */}
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-[#F8FBFF] rounded-xl border border-[#DCEEFF] text-[#64748B] hover:text-[#3B82F6] transition-colors shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[24px] lg:text-[28px] font-extrabold text-[#0F172A] tracking-tight truncate leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[14px] text-[#64748B] font-medium truncate hidden md:block mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Optional Page-Specific Controls or Global Search */}
      {children ? (
        <div className="flex items-center gap-3">
          {children}
        </div>
      ) : (
        /* CENTER SECTION: Global Search */
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search sensors, evidence, alerts, locations..." 
              className="w-full pl-11 pr-4 py-3.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-full text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] focus:bg-white transition-all shadow-sm placeholder:text-[#94A3B8] text-[#0F172A]"
            />
          </div>
        </div>
      )}

      {/* RIGHT SECTION: Notifications */}
      <div className="flex items-center gap-4 shrink-0 pl-8 relative" ref={notifRef}>
        
        {/* Notifications Bell Button */}
        <button 
          type="button" 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          aria-label="Notifications"
          className="relative p-3 bg-white border border-[#DCEEFF] rounded-full text-[#64748B] hover:text-[#3B82F6] shadow-sm hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] transition-all group cursor-pointer"
        >
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600 animate-wiggle' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-red-600 text-white font-mono font-bold text-[10.5px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* NOTIFICATION POPUP DROPDOWN */}
        <AnimatePresence>
          {isNotifOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#DCEEFF] overflow-hidden z-50 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h4 className="text-[14px] font-extrabold text-slate-900">System Notifications</h4>
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

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
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
    </header>
  );
};

export default PageHeader;
