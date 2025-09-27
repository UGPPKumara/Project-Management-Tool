const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
  projectName: { type: DataTypes.STRING, allowNull: false },
  clientName: { type: DataTypes.STRING, allowNull: false },
  clientContact: { type: DataTypes.STRING },
  service: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'Not Started' },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  otherDetails: { type: DataTypes.TEXT },
});

module.exports = Project;