import React, { useState, useEffect } from 'react';
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';

const UserFormModal = ({ user, onSave, onClose }) => {
  const [formState, setFormState] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'member',
  });

  useEffect(() => {
    if (user) {
      setFormState({ ...user, password: '' }); // Don't pre-fill password
    }
  }, [user]);

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField name="name" label="Full Name" value={formState.name} onChange={handleInputChange} required />
          <InputField name="username" label="Username" value={formState.username} onChange={handleInputChange} required />
          <InputField name="email" label="Email" type="email" value={formState.email} onChange={handleInputChange} required />
          <InputField name="password" label="Password" type="password" value={formState.password} onChange={handleInputChange} required={!user} placeholder={user ? "Leave blank to keep current password" : ""} />
          <SelectField name="role" label="Role" value={formState.role} onChange={handleInputChange} options={['admin', 'member']} />
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 mr-3 border rounded-md text-sm">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">{user ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;