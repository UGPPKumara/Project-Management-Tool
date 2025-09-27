const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');

// Define Associations
Project.belongsToMany(User, { through: ProjectMember });
User.belongsToMany(Project, { through: ProjectMember });

const db = {
  sequelize,
  User,
  Project,
  ProjectMember,
};

module.exports = db;