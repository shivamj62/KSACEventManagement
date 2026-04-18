import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleGuard from './components/RoleGuard';
import Navbar from './components/Navbar';
import AppInitGuard from './components/AppInitGuard';

import Login from './pages/Login';
import Register from './pages/Register';
import NewProposal from './pages/proposals/NewProposal';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ReviewerDashboard from './pages/dashboard/ReviewerDashboard';
import ProposalDetail from './pages/proposals/ProposalDetail';
import WorkflowSlider from './components/landing/WorkflowSlider';
import PhotoCarousel from './components/landing/PhotoCarousel';

import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Set the API Base URL for Production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

function App() {
  // Early Warmup Ping for Render Free Tier
  React.useEffect(() => {
    axios.get('/api/auth/profile').catch(() => {
      // We don't care about the result, just waking up the server
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <AppInitGuard>
                  <Home />
                </AppInitGuard>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Protected Routes */}
              <Route path="/dashboard/student" element={
                <RoleGuard allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleGuard>
              } />
              
              <Route path="/proposals/new" element={
                <RoleGuard allowedRoles={['student']}>
                  <NewProposal />
                </RoleGuard>
              } />

              <Route path="/proposals/edit/:id" element={
                <RoleGuard allowedRoles={['student']}>
                  <NewProposal isEdit={true} />
                </RoleGuard>
              } />

              {/* Reviewer Protected Routes (FIC + KSAC_CORE) */}
              <Route path="/dashboard/reviewer" element={
                <RoleGuard allowedRoles={['fic', 'ksac_core']}>
                  <ReviewerDashboard />
                </RoleGuard>
              } />

              <Route path="/proposals/:id" element={
                <RoleGuard allowedRoles={['student', 'fic', 'ksac_core']}>
                  <ProposalDetail />
                </RoleGuard>
              } />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <footer className="py-8 border-t border-white/5 text-center text-text-muted text-sm mt-auto">
            &copy; {new Date().getFullYear()} KIIT Student Activity Centre. All rights reserved.
            <p className="mt-2 text-text-secondary/60">Made with ❤️ by Shivam</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

const Home = () => {
  const { user, profile, role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'student') return '/dashboard/student';
    if (role === 'fic' || role === 'ksac_core') return '/dashboard/reviewer';
    return '/login';
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Design, Propose, & <span className="text-primary">Approve</span> Your Next Event.
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          The official KIIT Student Activity Centre (KSAC) portal for streamlined event proposals, 
          automated PDF generation, and real-time faculty approval.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          {user ? (
            <Link to={role === 'student' ? '/proposals/new' : getDashboardLink()} className="btn-primary text-base px-8">
              {role === 'student' ? 'Create New Proposal' : 'Go to Dashboard'}
            </Link>
          ) : (
            <Link to="/register" className="btn-primary text-base px-8">Get Started</Link>
          )}
          <Link to={getDashboardLink()} className="btn-secondary text-base px-8">Track Progress</Link>
        </div>
      </div>
      
      <WorkflowSlider />
      <PhotoCarousel />
    </main>
  );
};

export default App;
