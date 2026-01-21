import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useEffect } from 'react';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';

import AdminDashboard from './pages/admin/Dashboard';
import CreateCampaign from './pages/creator/CreateCampaign';
import CampaignDetail from './pages/creator/CampaignDetail';
import ApplicantsList from './pages/creator/ApplicantsList';
import CreatorDashboard from './pages/creator/Dashboard';
import ReceiverDashboard from './pages/receiver/Dashboard';
import JobDetail from './pages/JobDetail';
import WalletPage from './pages/WalletPage';

import MainLayout from './layouts/MainLayout';

const NotFound = () => <div className="p-8"><h1>404 Not Found</h1></div>;

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.role && location.pathname !== '/role-selection') {
      navigate('/role-selection');
    }
  }, [user, isAuthenticated, isLoading, location, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/campaigns/new" element={<CreateCampaign />} />
        <Route path="/creator/campaigns/:id/edit" element={<CreateCampaign />} />
        <Route path="/creator/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/creator/campaigns/:id/applicants" element={<ApplicantsList />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
        <Route path="/job/:id" element={<JobDetail />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role-selection" element={<RoleSelection />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
