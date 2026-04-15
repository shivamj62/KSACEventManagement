import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

const Navbar = () => {
  const { user, profile, role, logout } = useAuth();

  const getDashboardLink = () => {
    if (role === 'student') return '/dashboard/student';
    if (role === 'fic' || role === 'ksac_core') return '/dashboard/reviewer';
    return '/login';
  };

  return (
    <nav className="nav-blur h-16 flex items-center px-8 justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="KIIT Logo" className="w-10 h-10 object-contain" />
        <span className="font-display font-bold text-xl tracking-tight">KSAC <span className="text-primary">Events</span></span>
      </Link>
      <div className="flex gap-6 text-sm font-medium text-text-secondary items-center">
        {user ? (
          <>
            <Link to={getDashboardLink()} className="hover:text-text-primary transition-colors">Dashboard</Link>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-text-primary text-xs font-bold leading-none">{profile?.name || 'User'}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-tighter">{role || 'Member'}</p>
              </div>
              <button onClick={logout} className="btn-secondary py-1.5 px-4 text-xs">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-text-primary transition-colors py-2">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
