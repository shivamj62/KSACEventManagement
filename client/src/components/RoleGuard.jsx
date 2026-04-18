import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard protects routes based on authentication and user roles.
 * @param {string[]} allowedRoles - List of roles permitted to access this route.
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { user, role, isAppReady } = useAuth();
  const location = useLocation();

  // Safety fallback - AppInitGuard should prevent this from being null
  if (!isAppReady) return null;

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their default dashboard if role is unauthorized
    const targetDashboard = (role === 'fic' || role === 'ksac_core') ? '/dashboard/reviewer' : '/dashboard/student';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default RoleGuard;
