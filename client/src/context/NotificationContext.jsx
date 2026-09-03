import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import getSocket from '../services/socket';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('aware_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastAlert, setToastAlert] = useState(null);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aware_notifications', JSON.stringify(notifications.slice(0, 30)));
    } catch (err) {
      console.error('Error storing notifications:', err);
    }
  }, [notifications]);

  // Socket.io Realtime Listener
  useEffect(() => {
    const socket = getSocket();

    // 1. New Evidence / Incident Captured
    const handleEvidenceCaptured = (data) => {
      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'breach',
        title: 'New Environmental Breach Detected',
        message: `${data.evidenceId || 'Evidence'} • ${data.sensorId || 'Node'} at ${data.locationName || data.location || 'Station'} (${Number(data.voltage || 0).toFixed(3)} V)`,
        evidenceId: data.evidenceId,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'critical'
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 30));
      setToastAlert(newNotif);
    };

    // 2. Incident Status Transition
    const handleStatusUpdated = (data) => {
      const isResolved = data.incidentStatus === 'RESOLVED';
      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'status',
        title: isResolved ? 'Incident Resolved' : 'Incident Status Updated',
        message: `${data.evidenceId || 'Incident'} updated to ${data.incidentStatus} by ${data.updatedBy || 'Authority'}`,
        evidenceId: data.evidenceId,
        incidentStatus: data.incidentStatus,
        timestamp: new Date().toISOString(),
        read: false,
        severity: isResolved ? 'success' : 'info'
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 30));
      setToastAlert(newNotif);
    };

    // 3. Sensor Threshold Alert
    const handleSensorAlert = (data) => {
      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'alert',
        title: 'Sensor Threshold Alert',
        message: data.message || `Sensor ${data.deviceId} exceeded voltage threshold (${data.voltage} V)`,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'warning'
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 30));
    };

    socket.on('evidence-captured', handleEvidenceCaptured);
    socket.on('incident-status-updated', handleStatusUpdated);
    socket.on('sensor-alert', handleSensorAlert);

    return () => {
      socket.off('evidence-captured', handleEvidenceCaptured);
      socket.off('incident-status-updated', handleStatusUpdated);
      socket.off('sensor-alert', handleSensorAlert);
    };
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('aware_notifications');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toastAlert,
      setToastAlert,
      markAllAsRead,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
