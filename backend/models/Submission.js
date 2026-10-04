const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Problem = require('./Problem');

const Submission = sequelize.define('Submission', {
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
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Problem,
      key: 'id'
    }
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Accepted', 'Wrong Answer', 'Error'),
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['problemId'] },
    { fields: ['status'] }
  ]
});

User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

Problem.hasMany(Submission, { foreignKey: 'problemId' });
Submission.belongsTo(Problem, { foreignKey: 'problemId' });

module.exports = Submission;
