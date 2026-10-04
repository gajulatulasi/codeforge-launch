const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  problemCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Hidden'),
    defaultValue: 'Draft'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  inputFormat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  outputFormat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  constraints: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  supportedLanguages: {
    type: DataTypes.JSON,
    defaultValue: ['Java', 'Python', 'C', 'C++', 'JavaScript']
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      oneSubmissionOnly: true,
      allowCustomInput: false,
      showSampleTestcases: true,
      enableProblem: true,
      availableInPractice: true,
      availableInContest: false
    }
  },
  sampleTestcases: {
    type: DataTypes.JSON, // { input, output, explanation }
    defaultValue: []
  },
  hiddenTestcases: {
    type: DataTypes.JSON, // { input, output }
    defaultValue: []
  },
  // Keep legacy fields for backward compatibility, optional now
  day: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hiddenSolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unlockDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['difficulty'] },
    { fields: ['isActive'] },
    { fields: ['day'] },
    { fields: ['unlockDate'] }
  ]
});

module.exports = Problem;
