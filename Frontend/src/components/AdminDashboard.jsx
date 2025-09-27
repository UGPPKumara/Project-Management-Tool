import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProjectTable from "./ProjectTable.jsx";
import ProjectFormModal from "./ProjectFormModal.jsx";
import StatCard from "./StatCard.jsx";

const API_URL = 'http://localhost:5000/api/projects';

const AdminDashboard = ({ onLogout, token }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const axiosAuth = axios.create({
    headers: {
      'x-auth-token': token,
    },
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuth.get(API_URL);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (projectData.id) {
        await axiosAuth.put(`${API_URL}/${projectData.id}`, projectData);
      } else {
        await axiosAuth.post(API_URL, projectData);
      }
      fetchProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axiosAuth.delete(`${API_URL}/${projectId}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const filteredProjects = useMemo(
    () => {
      return projects.filter(
        (p) =>
          (p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clientName.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterService === 'All' || p.service === filterService)
      );
    },
    [projects, searchTerm, filterService]
  );

  const stats = useMemo(
    () => ({
      total: projects.length,
      inProgress: projects.filter((p) => p.status === 'In Progress').length,
      completed: projects.filter((p) => p.status === 'Completed').length,
      onHold: projects.filter((p) => p.status === 'On Hold').length,
    }),
    [projects]
  );

  const services = [
    'WordPress Development',
    'UI/UX Design (Web)',
    'UI/UX Design (Mobile)',
    'Social Media Marketing',
    'Mobile App Development',
    'SaaS Web Development',
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
          Nuvoora IT
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-100 bg-gray-700 rounded-md"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Dashboard
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-xl font-semibold">Project Dashboard</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Projects"
              value={stats.total}
              color="bg-blue-500"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              color="bg-yellow-500"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              color="bg-green-500"
            />
            <StatCard
              title="On Hold"
              value={stats.onHold}
              color="bg-red-500"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex gap-4 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 p-2 border rounded-md"
                />
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full md:w-64 p-2 border rounded-md"
                >
                  <option value="All">All Services</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
                className="w-full md:w-auto px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap"
              >
                + Add Project
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ProjectTable
                projects={filteredProjects}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          services={services}
        />
      )}
    </div>
  );
};

export default AdminDashboard;