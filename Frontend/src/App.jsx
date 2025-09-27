import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} token={token} />;
}