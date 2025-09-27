import React, { useState } from 'react';
import axios from 'axios';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      onLogin(res.data.token);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            ></path>
          </svg>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Nuvoora IT Solutions
          </h1>
          <p className="mt-2 text-sm text-gray-600">Admin Login</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-bold text-gray-600 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="password"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm font-medium"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;