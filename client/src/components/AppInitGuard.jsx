import React from 'react';
import { useAuth } from '../context/AuthContext';

const AppInitGuard = ({ children }) => {
  const { isAppReady } = useAuth();

  if (!isAppReady) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
        {/* Modern Neutral Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(23,209,90,0.2)]"></div>
        </div>
        
        <div className="mt-8 text-center space-y-2 animate-pulse">
          <p className="text-xl font-bold tracking-tight text-text-primary">Initializing Secure Session</p>
          <p className="text-sm text-text-muted font-medium">Connecting to KSAC Systems...</p>
        </div>

        {/* Branding Subtext */}
        <div className="absolute bottom-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/30">KIIT Student Activity Centre</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitGuard;
