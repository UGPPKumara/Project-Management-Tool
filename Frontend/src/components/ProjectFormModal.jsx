import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Import react-select
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';

const ProjectFormModal = ({ project, onSave, onClose, services, users }) => {
  const [formState, setFormState] = useState({
    projectName: '',
    clientName: '',
    clientContact: '',
    service: services[0] || 'WordPress Development',
    status: 'Not Started',
    startDate: '',
    endDate: '',
    otherDetails: '',
    members: [], // Add members to form state
  });
  
  const userOptions = users.map(u => ({ value: u.id, label: u.name || u.username }));

  useEffect(() => {
    if (project) {
      setFormState({
        ...project,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        members: project.Users ? project.Users.map(u => u.id) : [], // Map assigned users
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };
  
  const handleMemberChange = (selectedOptions) => {
      setFormState(prevState => ({ ...prevState, members: selectedOptions ? selectedOptions.map(o => o.value) : [] }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Project & Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
            <InputField name="projectName" label="Project Name" value={formState.projectName} onChange={handleInputChange} required />
            <InputField name="clientName" label="Client Name" value={formState.clientName} onChange={handleInputChange} required />
            <InputField name="clientContact" label="Client Contact (Email/Phone)" value={formState.clientContact} onChange={handleInputChange}/>
            <SelectField name="service" label="Service Type" value={formState.service} onChange={handleInputChange} options={services}/>
          </div>
          
          {/* Assign Members */}
          <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Members</label>
              <Select
                isMulti
                options={userOptions}
                value={userOptions.filter(option => formState.members.includes(option.value))}
                onChange={handleMemberChange}
                className="react-select-container"
                classNamePrefix="react-select"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField name="startDate" label="Start Date" type="date" value={formState.startDate} onChange={handleInputChange}/>
            <InputField name="endDate" label="Est. End Date" type="date" value={formState.endDate} onChange={handleInputChange}/>
          </div>
          <SelectField name="status" label="Project Status" value={formState.status} onChange={handleInputChange} options={['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled']}/>
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

export default ProjectFormModal;