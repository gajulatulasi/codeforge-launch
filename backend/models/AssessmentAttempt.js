const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Assessment = require('./Assessment');

const AssessmentAttempt = sequelize.define('AssessmentAttempt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  assessmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Assessment,
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tabSwitches: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  copyPasteAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('InProgress', 'Submitted', 'Disqualified'),
    defaultValue: 'InProgress'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['assessmentId'] }
  ]
});

User.hasMany(AssessmentAttempt, { foreignKey: 'userId' });
AssessmentAttempt.belongsTo(User, { foreignKey: 'userId' });

Assessment.hasMany(AssessmentAttempt, { foreignKey: 'assessmentId' });
AssessmentAttempt.belongsTo(Assessment, { foreignKey: 'assessmentId' });

module.exports = AssessmentAttempt;
