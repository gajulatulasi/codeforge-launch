const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Assessment = sequelize.define('Assessment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  assessmentCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    defaultValue: 'Medium'
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Hidden'),
    defaultValue: 'Draft'
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      timeLimitPerQuestion: 1, // in minutes
      totalQuestions: 10,
      randomizeQuestions: true,
      randomizeOptions: true,
      oneAttemptOnly: true,
      autoSubmitTimeExpiry: true,
      autoSubmitTabSwitches: 5,
      disableCopy: true,
      disablePaste: true,
      disableRightClick: true,
      enableAssessment: true
    }
  },
  adminSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      showResultsImmediately: false,
      showCorrectAnswersAfterSubmission: false,
      showExplanations: false,
      showScoreImmediately: true,
      showTopicWiseAnalysis: false,
      hideAnswersUntilEnd: true,
      allowReview: false
    }
  },
  questions: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of embedded question objects
  },
  // Legacy fields
  problemIds: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mcqIds: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['category'] }
  ]
});

module.exports = Assessment;
