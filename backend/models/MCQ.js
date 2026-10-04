const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MCQ = sequelize.define('MCQ', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON, // Array of strings e.g., ["A", "B", "C", "D"]
    allowNull: false
  },
  correctOption: {
    type: DataTypes.INTEGER, // Index of the correct option
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  topic: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['topic'] },
    { fields: ['isActive'] }
  ]
});

module.exports = MCQ;
