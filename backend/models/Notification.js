const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Announcement', 'Contest', 'Problem', 'Maintenance', 'System'),
    defaultValue: 'Announcement',
  },
  targetAudience: {
    type: DataTypes.ENUM('Global', 'Department', 'Year', 'Individual'),
    defaultValue: 'Global',
  },
  targetValue: {
    type: DataTypes.STRING, // e.g. "CSE" if targetAudience is Department, or userId if Individual
    allowNull: true,
  },
  isRead: {
    // Note: If notifications are global, tracking read status per user requires a mapping table.
    // For simplicity without a join table, we will use a JSON array to store users who read it,
    // or just not track read state globally, only locally in frontend, or create `UserNotification` mapping.
    // For now, let's keep it simple: global notifications just exist. We won't track per-user read state in DB for global ones to avoid massive join tables.
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notification;
