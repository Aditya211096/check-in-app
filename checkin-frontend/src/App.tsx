import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { GuestPortal } from './pages/GuestPortal';
import { StaffDashboard } from './pages/StaffDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('kashi_token'));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('kashi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem('kashi_token', newToken);
    localStorage.setItem('kashi_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('kashi_token');
    localStorage.removeItem('kashi_user');
    setToken(null);
    setUser(null);
  };

  // 1. Auth check
  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Role-based routing selection
  switch (user.role) {
    case 'CUSTOMER':
      return <GuestPortal token={token} user={user} onLogout={handleLogout} />;
    
    case 'STAFF':
    case 'HOUSEKEEPING':
    case 'KITCHEN':
      return <StaffDashboard token={token} user={user} onLogout={handleLogout} />;

    case 'MANAGER':
      return <ManagerDashboard token={token} user={user} onLogout={handleLogout} />;

    case 'OWNER':
      return <OwnerDashboard token={token} user={user} onLogout={handleLogout} />;

    default:
      return (
        <div className="app-container justify-center items-center">
          <p className="text-sm text-text-secondary">Invalid user role.</p>
          <button onClick={handleLogout} className="kashi-btn kashi-btn-secondary mt-4">
            Logout
          </button>
        </div>
      );
  }
};

export default App;
