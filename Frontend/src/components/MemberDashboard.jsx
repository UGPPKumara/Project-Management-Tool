import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProjectTable from './ProjectTable.jsx';
import StatCard from './StatCard.jsx';
import jwt_decode from 'jwt-decode';

const API_URL = 'http://localhost:5000/api/projects';

const MemberDashboard = ({ onLogout, token }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const decoded = jwt_decode(token);
    setUserId(decoded.user.id);
  }, [token]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { 'x-auth-token': token },
      });
      // Filter projects to show only those assigned to the current user
      const assignedProjects = response.data.filter(p =>
        p.Users.some(user => user.id === userId)
      );
      setProjects(assignedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    onHold: projects.filter(p => p.status === 'On Hold').length,
  }), [projects]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
          Nuvoora IT
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-2 text-gray-100 bg-gray-700 rounded-md">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            My Projects
          </a>
           {/* Link to Profile Page can be added here */}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-xl font-semibold">My Project Dashboard</h1>
          <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Logout</button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Assigned Projects" value={stats.total} color="bg-blue-500" />
            <StatCard title="In Progress" value={stats.inProgress} color="bg-yellow-500" />
            <StatCard title="Completed" value={stats.completed} color="bg-green-500" />
            <StatCard title="On Hold" value={stats.onHold} color="bg-red-500" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">My Assigned Projects</h2>
            {isLoading ? <div className="text-center py-8">Loading...</div> : (
              <ProjectTable projects={projects} onEdit={() => {}} onDelete={() => {}} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;