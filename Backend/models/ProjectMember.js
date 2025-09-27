const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Project = require('./Project');
const User = require('./User');

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

Project.belongsToMany(User, { through: ProjectMember });
User.belongsToMany(Project, { through: ProjectMember });

module.exports = ProjectMember;