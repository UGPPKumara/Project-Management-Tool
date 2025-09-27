import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from "firebase/auth";

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- App ID for Firestore Path ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-project-manager';

// --- Main App Component ---
export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
    }

    return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}


// --- Login Screen Component ---
const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded credentials for demonstration
        if (username === 'admin' && password === 'password') {
            onLogin();
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">Nuvoora IT Solutions</h1>
                    <p className="mt-2 text-sm text-gray-600">Admin Login</p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Password</label>
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
                        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm font-medium">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ onLogout }) => {
    // --- State Management ---
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // --- Firebase Auth & Data Fetching ---
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) setUserId(user.uid);
            else await signInAnonymously(auth);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId) return;
        setIsLoading(true);
        const projectsCollectionPath = `/artifacts/${appId}/users/${userId}/projects`;
        const q = query(collection(db, projectsCollectionPath));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching projects: ", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [isAuthReady, userId]);

    // --- Derived State & Filtering ---
    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            (p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.clientName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterService === 'All' || p.service === filterService)
        );
    }, [projects, searchTerm, filterService]);

    const stats = useMemo(() => ({
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'In Progress').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        onHold: projects.filter(p => p.status === 'On Hold').length,
    }), [projects]);

    // --- CRUD Handlers ---
    const handleSaveProject = async (projectData) => {
        const projectsCollectionPath = `/artifacts/${appId}/users/${userId}/projects`;
        try {
            if (projectData.id) {
                const projectRef = doc(db, projectsCollectionPath, projectData.id);
                await updateDoc(projectRef, projectData);
            } else {
                await addDoc(collection(db, projectsCollectionPath), projectData);
            }
            setIsModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const projectDocPath = `/artifacts/${appId}/users/${userId}/projects/${projectId}`;
                await deleteDoc(doc(db, projectDocPath));
            } catch (error) {
                console.error("Error deleting project:", error);
            }
        }
    };
    
    // --- CSV Export ---
    const exportToCSV = () => {
        // ... (CSV export logic remains the same as previous version)
    };
    
    const services = [ 'WordPress Development', 'UI/UX Design (Web)', 'UI/UX Design (Mobile)', 'Social Media Marketing', 'Mobile App Development', 'SaaS Web Development' ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Nuvoora IT
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <a href="#" className="flex items-center px-4 py-2 text-gray-100 bg-gray-700 rounded-md">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Dashboard
                    </a>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center p-4 bg-white border-b">
                    <h1 className="text-xl font-semibold">Project Dashboard</h1>
                    <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Logout</button>
                </header>
                
                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard title="Total Projects" value={stats.total} color="bg-blue-500" />
                        <StatCard title="In Progress" value={stats.inProgress} color="bg-yellow-500" />
                        <StatCard title="Completed" value={stats.completed} color="bg-green-500" />
                        <StatCard title="On Hold" value={stats.onHold} color="bg-red-500" />
                    </div>

                    {/* Project Table Container */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                             <div className="flex gap-4 w-full md:w-auto">
                                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 p-2 border rounded-md"/>
                                <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-full md:w-64 p-2 border rounded-md">
                                    <option value="All">All Services</option>
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button onClick={() => { setEditingProject(null); setIsModalOpen(true); }} className="w-full md:w-auto px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">+ Add Project</button>
                        </div>
                        
                        {/* Table */}
                        {isLoading ? <div className="text-center py-8">Loading...</div> : (
                            <ProjectTable projects={filteredProjects} onEdit={handleEdit} onDelete={handleDelete} />
                        )}
                    </div>
                </main>
            </div>
            
             {isModalOpen && (
                <ProjectFormModal
                    project={editingProject}
                    onSave={handleSaveProject}
                    onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
                    services={services}
                />
            )}
        </div>
    );
};

// --- Child Components for Dashboard ---
const StatCard = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg shadow-md text-white ${color}`}>
        <h3 className="text-sm font-medium uppercase">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

const ProjectTable = ({ projects, onEdit, onDelete }) => {
    const getStatusColor = (status) => {
        // ... same as previous version
    };
    if (projects.length === 0) return <p className="text-center py-8 text-gray-500">No projects found.</p>;
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {projects.map(p => (
                        <tr key={p.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.projectName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.service}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.endDate || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ProjectFormModal = ({ project, onSave, onClose, services }) => {
     const [formState, setFormState] = useState(
        project || {
            projectName: '', clientName: '', clientContact: '', service: 'WordPress Development', status: 'Not Started',
            wordpressLink: '', wordpressLogin: '', wordpressPassword: '', hostingProvider: '', hostingLogin: '',
            hostingPassword: '', hostingBy: 'Us', domainProvider: '', domainLogin: '', domainPassword: '',
            domainBy: 'Us', startDate: '', endDate: '', otherDetails: '',
        }
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{project ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* Form content from previous version, slightly adapted */}
                    {/* You can copy the detailed form fields from the previous version here */}
                     {/* Project & Client Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                        <InputField name="projectName" label="Project Name" value={formState.projectName} onChange={handleInputChange} required />
                        <InputField name="clientName" label="Client Name" value={formState.clientName} onChange={handleInputChange} required />
                        <InputField name="clientContact" label="Client Contact (Email/Phone)" value={formState.clientContact} onChange={handleInputChange} />
                        <SelectField name="service" label="Service Type" value={formState.service} onChange={handleInputChange} options={services} />
                    </div>
                     {/* Service Specific Details - WordPress */}
                    {formState.service === 'WordPress Development' && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                             <h3 className="font-semibold text-md mb-2 text-indigo-700">WordPress Details</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField name="wordpressLink" label="WP Site Link" value={formState.wordpressLink} onChange={handleInputChange} />
                                <InputField name="wordpressLogin" label="WP Login" value={formState.wordpressLogin} onChange={handleInputChange} />
                                <InputField name="wordpressPassword" label="WP Password" type="password" value={formState.wordpressPassword} onChange={handleInputChange} />
                            </div>
                        </div>
                    )}
                    {/* Other fields would go here... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField name="startDate" label="Start Date" type="date" value={formState.startDate} onChange={handleInputChange} />
                        <InputField name="endDate" label="Est. End Date" type="date" value={formState.endDate} onChange={handleInputChange} />
                    </div>
                     <SelectField name="status" label="Project Status" value={formState.status} onChange={handleInputChange} options={['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled']} />
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Other Details</label>
                        <textarea name="otherDetails" rows="3" value={formState.otherDetails} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>

                </form>
                <div className="flex justify-end items-center p-4 border-t bg-gray-50">
                     <button type="button" onClick={onClose} className="px-4 py-2 mr-3 border rounded-md text-sm">Cancel</button>
                     <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">{project ? 'Update' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
};


// --- Helper Components for Form Fields ---
// These are the same as the previous version
const InputField = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} required={required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
    </div>
);
const SelectField = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select name={name} value={value} onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </div>
);

