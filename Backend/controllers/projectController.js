const { Project, User } = require('../models'); // Corrected import

// Get all projects and their assigned members
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: {
        model: User,
        attributes: ['id', 'username', 'name'],
        through: { attributes: [] }, // Hides the join table attributes
      },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new project and assign members
exports.createProject = async (req, res) => {
  const { members, ...projectData } = req.body;
  try {
    const project = await Project.create(projectData);
    if (members && members.length > 0) {
      await project.setUsers(members);
    }
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing project and its members
exports.updateProject = async (req, res) => {
  const { members, ...projectData } = req.body;
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.update(projectData);
    if (members) {
      await project.setUsers(members);
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};