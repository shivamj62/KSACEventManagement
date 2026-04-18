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

  // Show a integrated, minimalist spinner while verifying session on internal pages
  if (!isAppReady) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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
