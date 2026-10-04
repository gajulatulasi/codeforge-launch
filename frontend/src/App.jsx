import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';

import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import ProblemPage from './pages/ProblemPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div></div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  // Redirect admin away from member dashboard to admin dashboard
  if (!adminOnly && user.role === 'Admin' && window.location.pathname === '/dashboard') {
     return <Navigate to="/admin" />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/problem/:id" element={
            <ProtectedRoute>
              <ProblemPage />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster position="bottom-right" toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
        }} />
      </Router>
    </AuthProvider>
  );
};

export default App;
