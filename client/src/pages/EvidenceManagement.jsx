import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EvidenceSummaryCards from '../components/evidence/EvidenceSummaryCards';
import EvidenceFilters from '../components/evidence/EvidenceFilters';
import EvidenceCard from '../components/evidence/EvidenceCard';
import EvidenceDrawer from '../components/evidence/EvidenceDrawer';
import EvidenceSkeleton from '../components/evidence/EvidenceSkeleton';
import { Search, Filter, RefreshCw, FolderSearch, Camera } from 'lucide-react';

const EvidenceManagement = () => {
  const [evidenceData, setEvidenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/evidence');
      setEvidenceData(response.data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/evidence/${id}`);
      setEvidenceData(prev => prev.filter(e => e._id !== id));
      setSelectedEvidence(prev => (prev?._id === id ? null : prev));
    } catch (error) {
      console.error('Error deleting evidence:', error);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const openDrawer = useCallback((evidence) => {
    setSelectedEvidence(evidence);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Safe Filter Logic
  const query = searchQuery.trim().toLowerCase();
  const filteredEvidence = evidenceData.filter(item => {
    const idMatch = (item.evidenceId || '').toLowerCase().includes(query);
    const locMatch = (item.locationName || item.location || '').toLowerCase().includes(query);
    const matchesSearch = !query || idMatch || locMatch;
    const matchesType = filterType === 'All' || item.detectionType === filterType;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader 
        title="Evidence Management"
        description="Manage AI captured evidence, verify incidents and generate reports."
      >
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all w-full sm:w-64"
            />
          </div>
          <button onClick={handleRefresh} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </PageHeader>

      <div className="p-4 sm:p-8 w-full max-w-[1600px] mx-auto flex-1 flex flex-col font-sans">
        
        <EvidenceSummaryCards data={evidenceData} />
        
        <EvidenceFilters 
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onReset={() => {
            setSearchQuery('');
            setFilterType('All');
            setFilterStatus('All');
          }}
        />

        {/* Evidence Grid */}
        <div className="mt-8 flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <EvidenceSkeleton key={i} />)}
            </div>
          ) : evidenceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 bg-white/50 backdrop-blur-sm rounded-[24px] border border-dashed border-[#DCEEFF] text-center p-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
                <Camera className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">No Evidence Captured Yet</h3>
              <p className="text-slate-600 mt-2 font-medium">Waiting for the ESP32-CAM to detect and upload evidence.</p>
              <p className="text-slate-500 mt-2 max-w-md text-[15px] leading-relaxed">
                Once an incident is detected, captured images will automatically appear here along with AQI, AI confidence, location and timestamps.
              </p>
              <button 
                onClick={handleRefresh}
                className="mt-6 px-6 py-2.5 text-[15px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          ) : filteredEvidence.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              {filteredEvidence.map(item => (
                <EvidenceCard 
                  key={item._id} 
                  evidence={item} 
                  onView={() => openDrawer(item)}
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white/50 backdrop-blur-sm rounded-[24px] border border-dashed border-[#DCEEFF] text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <FolderSearch className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Evidence Found</h3>
              <p className="text-slate-500 mt-2 max-w-md">Try adjusting your filters or search query to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterType('All'); setFilterStatus('All'); }}
                className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Drawer */}
      <EvidenceDrawer 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer} 
        evidence={selectedEvidence} 
      />
    </div>
  );
};

export default EvidenceManagement;
