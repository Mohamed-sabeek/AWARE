import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Calendar,
  Users,
  Building2
} from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const AdminAuthorityUsers = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/authority-users');
      if (data && data.success) {
        setAuthorities(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching authorities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthorities();
  }, [fetchAuthorities]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateAuthority = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', message: '' });

    if (!formData.fullName || !formData.email || !formData.password) {
      setFeedback({ type: 'error', message: 'Full name, email, and password are required.' });
      setFormLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      setFormLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/create-authority', formData);
      if (data && data.success) {
        setFeedback({ type: 'success', message: '✓ Authority account created successfully!' });
        setFormData({ fullName: '', email: '', phoneNumber: '', password: '' });
        fetchAuthorities();
        setTimeout(() => {
          setIsModalOpen(false);
          setFeedback({ type: '', message: '' });
        }, 1500);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create Authority user account.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full font-sans">
      <PageHeader
        title="Authority Officers"
        description="Provision and manage official Environmental Protection Officer accounts."
      >
        <button
          type="button"
          onClick={() => {
            setFeedback({ type: '', message: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13.5px] font-bold shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Authority</span>
        </button>
      </PageHeader>

      <div className="p-4 sm:p-8 w-full max-w-[1500px] mx-auto flex-1 flex flex-col gap-6">
        
        {/* KPI Banner */}
        <div className="bg-white border border-[#DCEEFF] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-slate-900">Provisioned Authority Accounts</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Only verified accounts can inspect telemetry and transition incident responses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-[13px] border border-blue-100">
              {authorities.length} Active Officers
            </span>
            <button
              type="button"
              onClick={fetchAuthorities}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Officers Table / Grid */}
        <div className="bg-white border border-[#DCEEFF] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E2F0FF] bg-white flex items-center justify-between">
            <h4 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Registered Officers
            </h4>
            <span className="text-[12px] font-bold text-slate-400 font-mono">ROLE: AUTHORITY</span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-[13.5px] font-bold text-slate-700">Loading Authority directory...</p>
            </div>
          ) : authorities.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500">
              <ShieldCheck className="w-12 h-12 text-slate-300 mb-2" />
              <h4 className="text-[16px] font-extrabold text-slate-800">No Authority Officers Registered</h4>
              <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
                Click "+ Add Authority" above to provision the first regional officer account.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {authorities.map((officer) => (
                <div 
                  key={officer._id}
                  className="p-5 hover:bg-[#F8FBFF] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-[15px] flex items-center justify-center shadow-xs shrink-0">
                      {officer.fullName ? officer.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] font-extrabold text-slate-900">{officer.fullName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                          Authority
                        </span>
                        {officer.isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12.5px] text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {officer.email}
                        </span>
                        {officer.phoneNumber && officer.phoneNumber !== 'N/A' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {officer.phoneNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[12px] text-slate-400 font-mono">
                    <p>Created: {officer.createdAt ? new Date(officer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pre-configured'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* CREATE AUTHORITY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[24px] shadow-2xl border border-[#DCEEFF] w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F8FBFF]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-slate-900">Add Authority Officer</h3>
                    <p className="text-[12.5px] text-slate-500">Provision a verified response officer account</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback.message && (
                <div className={`mx-6 mt-4 p-3.5 rounded-xl text-[13px] font-bold border flex items-center gap-2.5 ${
                  feedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleCreateAuthority} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Officer Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Officer Sarah Jenkins"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="officer@aware.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Initial Password * (Min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DCEEFF] rounded-xl text-[14px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-[12px]">
                  <span className="font-bold text-blue-900">Enforced System Role:</span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
                    AUTHORITY
                  </span>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 font-bold text-[13.5px] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {formLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Create Authority Account</span>
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminAuthorityUsers;
