import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';

import AdminDashboard from './pages/admin/Dashboard';
import CreatorDashboard from './pages/creator/Dashboard';
import ReceiverDashboard from './pages/receiver/Dashboard';

import MainLayout from './layouts/MainLayout';

// Placeholder components for routing structure
// const Home = () => <div className="p-8"><h1>Home Page</h1></div>;
const NotFound = () => <div className="p-8"><h1>404 Not Found</h1></div>;

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If authenticated, not loading, and user has no role, redirect to selection
    // Also avoid loop if already on /role-selection
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
        <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
