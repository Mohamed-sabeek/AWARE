import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, AlertTriangle, FileVideo, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FBFF] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back,</h1>
            <p className="text-xl text-blue-600 font-semibold">{user?.fullName}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Status Indicator */}
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium inline-flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          Logged in successfully as Administrator
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Activity} label="Total Sensors" value="24" color="text-blue-500" />
          <StatCard icon={AlertTriangle} label="Active Alerts" value="3" color="text-red-500" />
          <StatCard icon={FileVideo} label="Evidence Captured" value="18" color="text-indigo-500" />
          <StatCard icon={Server} label="System Status" value="Operational" color="text-emerald-500" />
        </div>

        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Session Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Name" value={user?.fullName} />
            <InfoField label="Email" value={user?.email} />
            <InfoField label="Phone" value={user?.phoneNumber} />
            <InfoField label="Role" value={user?.role} className="capitalize" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-gray-500 font-medium">{label}</h3>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

const InfoField = ({ label, value, className = '' }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`font-medium text-gray-900 ${className}`}>{value || 'N/A'}</p>
  </div>
);

export default AdminDashboard;
