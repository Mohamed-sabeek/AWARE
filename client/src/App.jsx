import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import EvidenceManagement from './pages/EvidenceManagement';
import ActivityLogs from './pages/ActivityLogs';
import GISMap from './pages/GISMap';
import SatelliteMonitoring from './pages/SatelliteMonitoring';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            } 
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="monitoring" element={<LiveMonitoring />} />
            <Route path="evidence" element={<EvidenceManagement />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="map" element={<GISMap />} />
            <Route path="satellite" element={<SatelliteMonitoring />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
