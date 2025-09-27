const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// The join table model itself is very simple now
const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = ProjectMember;