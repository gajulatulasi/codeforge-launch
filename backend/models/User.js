const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Member'),
    defaultValue: 'Member'
  },
  accountStatus: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  branch: {
    type: DataTypes.STRING
  },
  year: {
    type: DataTypes.STRING
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedProblems: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActive: {
    type: DataTypes.DATE
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true // Allow null for existing users
  },
  resetOtp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.password && user.changed('password') && !user.password.startsWith('$2')) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  indexes: [
    { fields: ['role'] },
    { fields: ['accountStatus'] },
    { fields: ['branch'] },
    { fields: ['year'] },
    { fields: ['isBlocked'] },
    { fields: ['rollNumber'] }
  ]
});

module.exports = User;
