import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import MemberDashboard from './components/MemberDashboard.jsx';
import './index.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} token={token} />;
  }

  if (role === 'member') {
    return <MemberDashboard onLogout={handleLogout} token={token} />;
  }

  // Fallback for any other case
  return <LoginScreen onLogin={handleLogin} />;
}