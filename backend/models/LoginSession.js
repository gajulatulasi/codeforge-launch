const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const LoginSession = sequelize.define('LoginSession', {
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
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  logoutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['loginTime'] }
  ]
});

User.hasMany(LoginSession, { foreignKey: 'userId' });
LoginSession.belongsTo(User, { foreignKey: 'userId' });

module.exports = LoginSession;
