import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Satellite, Calendar, Globe, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PremiumSummaryCard from '../components/ui/PremiumSummaryCard';
import SatelliteFilterBar from '../components/satellite/SatelliteFilterBar';
import SatelliteMap from '../components/satellite/SatelliteMap';
import InfoPanel from '../components/satellite/InfoPanel';
import SatelliteDetails from '../components/satellite/SatelliteDetails';
import ComparisonCard from '../components/satellite/ComparisonCard';
import LoadingSkeleton from '../components/satellite/LoadingSkeleton';

const today = new Date().toISOString().split('T')[0];

const SatelliteMonitoring = () => {
  const [mapObservations, setMapObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [error, setError] = useState(null);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [success, setSuccess] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [searchedDays, setSearchedDays] = useState(0);
  const [actualObservationDate, setActualObservationDate] = useState(null);
  const [requestedDate, setRequestedDate] = useState(null);

  // Filter state
  const [region, setRegion] = useState('Chennai'); // Default to Chennai to trigger initial fetch
  const [pollutant, setPollutant] = useState('NO2'); // Default to NO2
  const [date, setDate] = useState(today); // Default to today

  // Map controls
  const [opacity, setOpacity] = useState(80);

  // Fetch map data (all regions, cached, latest)
  const fetchMapData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get(`/satellite/map?pollutant=${pollutant === 'All' ? 'NO2' : pollutant}`);
      setMapObservations(data);
      if (region === 'All' && data.length > 0 && !silent) {
        setSelectedObservation(data[0]);
      }
    } catch (err) {
      console.error(err);
      if (!silent) setError('Failed to load map data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch specific live observation
  const fetchLiveObservation = async () => {
    if (region === 'All' || !date || pollutant === 'All') return;
    
    try {
      setIsFetchingLive(true);
      setError(null);
      const { data } = await api.get(`/satellite/observations`, {
        params: { region, pollutant, date }
      });
      
      setSuccess(data.success);
      setRequestedDate(data.requestedDate);
      
      if (data.success) {
        setSelectedObservation(data.observation);
        setUsedFallback(data.usedFallback);
        setSearchedDays(data.searchedDays);
        setActualObservationDate(data.actualObservationDate);
        
        // Refresh map and cards silently with latest backend cache
        fetchMapData(true);
      } else {
        setSelectedObservation(null);
        setUsedFallback(false);
        setSearchedDays(7);
        setActualObservationDate(null);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      
      if (errMsg.includes('Unable to authenticate')) {
        setError('Unable to authenticate with CDSE');
      } else {
        setError('API failed to fetch CDSE data.');
      }
      setSelectedObservation(null);
      setSuccess(false);
    } finally {
      setIsFetchingLive(false);
      setLoading(false); // Clear initial loading if applicable
    }
  };

  // Effect: When pollutant changes, fetch map data
  useEffect(() => {
    fetchMapData();
  }, [pollutant]);

  // Effect: When region, date, pollutant change, fetch specific observation if applicable
  useEffect(() => {
    if (region !== 'All' && date && pollutant !== 'All') {
      fetchLiveObservation();
    } else if (region === 'All') {
      // If reset to all, deselect so the map zooms out to show the whole state
      setSelectedObservation(null);
    }
  }, [region, date, pollutant]);

  // Summary card values based on mapObservations (aggregate)
  const avgQuality = mapObservations.length > 0
    ? (mapObservations.reduce((s, o) => s + (o.quality || 95), 0) / mapObservations.length).toFixed(0)
    : 0;
  
  // Use selected observation date if available, else latest map observation date
  const latestDate = selectedObservation 
    ? new Date(selectedObservation.observationTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : mapObservations[0] 
      ? new Date(mapObservations[0].observationTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
      : '—';

  const resetFilters = () => {
    setRegion('All');
    setPollutant('NO2');
    setDate(today);
  };

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader
        title="Satellite Monitoring"
        subtitle="Compare ground sensor data with satellite-based environmental observations."
      />

      <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 pb-24">

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex items-center justify-between">
            <div className="font-medium text-red-600">{error}</div>
            <button 
              onClick={fetchLiveObservation}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* ─── FALLBACK BANNERS ─── */}
            {!success && region !== 'All' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between mb-2">
                <div className="text-yellow-800 text-sm font-medium">
                  No Sentinel-5P observations are available for this region during the last 7 days.
                </div>
                <button
                  onClick={() => document.querySelector('input[type="date"]').showPicker?.()}
                  className="px-4 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-bold rounded-lg transition-colors border border-yellow-300"
                >
                  Choose another date
                </button>
              </div>
            )}

            {success && usedFallback && region !== 'All' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-2">
                <div className="text-blue-800 text-sm font-semibold mb-1">Latest available satellite observation</div>
                <div className="text-blue-600 text-xs leading-relaxed">
                  Requested date: <span className="font-bold">{new Date(requestedDate).toLocaleDateString('en-GB')}</span><br/>
                  Showing data from: <span className="font-bold">{new Date(actualObservationDate).toLocaleDateString('en-GB')}</span> (searched back {searchedDays} days)<br/>
                  Reason: No valid satellite observation was available on the requested date.
                </div>
              </div>
            )}

            {/* ─── SUMMARY CARDS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PremiumSummaryCard
                title="Satellite Source"
                value={mapObservations.length > 0 ? 1 : 0}
                total={1}
                decimals={0}
                trendVal={mapObservations.length > 0 ? 'Sentinel-5P' : 'No Data'}
                trendDir="none"
                trendPeriod=""
                statusText={mapObservations.length > 0 ? 'Connected' : 'Waiting'}
                icon={Satellite}
                themeColor="#8b5cf6"
                gradientBg="from-purple-50/40 to-transparent"
                delay={0.1}
                percentageOverride={mapObservations.length > 0 ? 100 : 0}
              />
              <PremiumSummaryCard
                title="Total Observations"
                value={mapObservations.length}
                total={mapObservations.length || 1}
                decimals={0}
                trendVal={latestDate}
                trendDir="none"
                trendPeriod=""
                statusText={mapObservations.length > 0 ? 'Updated' : 'Empty'}
                icon={Calendar}
                themeColor="#0ea5e9"
                gradientBg="from-sky-50/40 to-transparent"
                delay={0.15}
                percentageOverride={100}
              />
              <PremiumSummaryCard
                title="Coverage Region"
                value={mapObservations.length}
                total={12}
                decimals={0}
                trendVal="Tamil Nadu"
                trendDir="none"
                trendPeriod=""
                statusText="Live Region"
                icon={Globe}
                themeColor="#10b981"
                gradientBg="from-emerald-50/40 to-transparent"
                delay={0.2}
              />
              <PremiumSummaryCard
                title="Data Quality"
                value={Number(avgQuality)}
                total={100}
                decimals={0}
                trendVal="Verified"
                trendDir="none"
                trendPeriod=""
                statusText="Verified"
                icon={ShieldCheck}
                themeColor="#3b82f6"
                gradientBg="from-blue-50/40 to-transparent"
                delay={0.25}
              />
            </div>

            {/* ─── FILTER BAR ─── */}
            <SatelliteFilterBar
              region={region} setRegion={setRegion}
              pollutant={pollutant} setPollutant={setPollutant}
              date={date} setDate={setDate}
              onReset={resetFilters}
            />

            {/* ─── OPACITY SLIDER ─── */}
            <div className="bg-white border border-[#E2F0FF] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
              <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Layer Opacity</span>
              <input
                type="range" min={10} max={100} value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="flex-1 h-1.5 accent-[#3B82F6] cursor-pointer"
              />
              <span className="text-[13px] font-bold text-[#3B82F6] w-10 text-right">{opacity}%</span>
            </div>

            {/* ─── MAP + INFO PANEL ─── */}
            {mapObservations.length === 0 && !selectedObservation ? (
              <div className="flex flex-col items-center justify-center h-72 bg-white/50 border border-dashed border-[#DCEEFF] rounded-[24px] text-center p-6">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Satellite className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Satellite Observations Available</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  No observations match your current filters. Try adjusting the region, pollutant, or date.
                </p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <SatelliteMap
                  observations={
                    selectedObservation && !mapObservations.find(o => o._id === selectedObservation._id)
                      ? [...mapObservations, selectedObservation]
                      : mapObservations
                  }
                  selectedObservation={selectedObservation}
                  onSelectObservation={(obs) => {
                    setRegion(obs.region);
                    // It will trigger fetchLiveObservation automatically if date and pollutant are valid
                  }}
                  activePollutant={pollutant === 'All' ? 'NO2' : pollutant}
                  opacity={opacity}
                />
                <InfoPanel 
                  selectedObservation={selectedObservation} 
                  region={region} 
                  isFetchingLive={isFetchingLive}
                />
              </div>
            )}

            {/* ─── BOTTOM SECTION: Satellite Details + Comparison ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SatelliteDetails latestObservation={selectedObservation || mapObservations[0]} />
              <ComparisonCard observations={selectedObservation ? [selectedObservation] : mapObservations} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SatelliteMonitoring;
