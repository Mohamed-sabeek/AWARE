import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import SummaryCards from '../components/gis/SummaryCards';
import FilterBar from '../components/gis/FilterBar';
import LeafletMap from '../components/gis/LeafletMap';
import DetailsPanel from '../components/gis/DetailsPanel';
import LoadingSkeleton from '../components/gis/LoadingSkeleton';

const GISMap = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [aqi, setAqi] = useState('All');
  
  // Selection State
  const [selectedSensor, setSelectedSensor] = useState(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const { data } = await api.get('/sensors');
      setSensors(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError('Failed to load map data. Please check your connection.');
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    setType('All');
    setAqi('All');
    setSelectedSensor(null);
  };

  const filteredSensors = sensors.filter(sensor => {
    // Text search
    const matchesSearch = sensor.location.toLowerCase().includes(search.toLowerCase()) || 
                          sensor.sensorId.toLowerCase().includes(search.toLowerCase());
    
    // Status match
    const matchesStatus = status === 'All' || sensor.status === status;
    
    // Type match
    const matchesType = type === 'All' || sensor.detectionType === type;
    
    // AQI match
    let matchesAqi = true;
    if (aqi !== 'All') {
      if (aqi.includes('Good') && sensor.aqi > 50) matchesAqi = false;
      if (aqi.includes('Moderate') && (sensor.aqi < 51 || sensor.aqi > 100)) matchesAqi = false;
      if (aqi.includes('Poor') && (sensor.aqi < 101 || sensor.aqi > 200)) matchesAqi = false;
      if (aqi.includes('Hazardous') && sensor.aqi < 201) matchesAqi = false;
    }

    return matchesSearch && matchesStatus && matchesType && matchesAqi;
  });

  return (
    <div className="max-w-[1600px] mx-auto w-full min-h-full flex flex-col pt-8 pb-32 px-8">
      <PageHeader 
        title="GIS Monitoring" 
        subtitle="Monitor sensor locations and environmental incidents on an interactive map."
      />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 font-medium">
          {error}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-[700px] pb-16">
          <SummaryCards sensors={sensors} />
          
          <FilterBar 
            search={search} setSearch={setSearch}
            status={status} setStatus={setStatus}
            type={type} setType={setType}
            aqi={aqi} setAqi={setAqi}
            onReset={resetFilters}
          />

          <div className="flex-1 flex flex-col lg:flex-row gap-6 relative min-h-[500px]">
            {/* Map Area - 70% width on Desktop */}
            <LeafletMap 
              sensors={filteredSensors} 
              selectedSensor={selectedSensor}
              onSelectSensor={setSelectedSensor}
            />

            {/* Details Panel - 30% width on Desktop */}
            <div className={`
              lg:w-[350px] xl:w-[400px] h-[500px] lg:h-auto shrink-0 transition-all duration-300
              ${selectedSensor ? 'opacity-100 translate-y-0 lg:translate-x-0' : 'opacity-50 lg:opacity-100'}
            `}>
              <DetailsPanel 
                selectedSensor={selectedSensor} 
                onClose={() => setSelectedSensor(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GISMap;
