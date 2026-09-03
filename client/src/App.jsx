import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthorityLayout from './layouts/AuthorityLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import EvidenceManagement from './pages/EvidenceManagement';
import ActivityLogs from './pages/ActivityLogs';
import GISMap from './pages/GISMap';
import SatelliteMonitoring from './pages/SatelliteMonitoring';
import AdminAnalytics from './pages/AdminAnalytics';
import SensorLocation from './pages/SensorLocation';
import AuthorityDashboard from './pages/AuthorityDashboard';
import IncidentResponse from './pages/IncidentResponse';
import AdminAuthorityUsers from './pages/AdminAuthorityUsers';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          
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
            <Route path="location" element={<SensorLocation />} />
            <Route path="alerts" element={<ActivityLogs />} />
            <Route path="evidence" element={<EvidenceManagement />} />
            <Route path="users" element={<AdminAuthorityUsers />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="map" element={<GISMap />} />
            <Route path="satellite" element={<SatelliteMonitoring />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Protected Authority Routes */}
          <Route 
            path="/authority" 
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <AuthorityLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AuthorityDashboard />} />
            <Route path="incidents" element={<IncidentResponse />} />
            <Route path="incidents/:incidentId" element={<IncidentResponse />} />
            <Route path="evidence" element={<EvidenceManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
