const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const { protect, admin } = require('../middleware/authMiddleware');

// Settings are stored as a JSON blob in a single row for simplicity, or we can just mock it 
// since the prompt implies an enable/disable settings page.
// Let's create a Settings model if it doesn't exist, or just use a simple JSON file / mock for this phase.
// Actually, creating a model is better.
const { DataTypes } = require('sequelize');

const Setting = sequelize.define('Setting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  maxTabSwitches: { type: DataTypes.INTEGER, defaultValue: 5 },
  enableCopyProtection: { type: DataTypes.BOOLEAN, defaultValue: true },
  enablePasteProtection: { type: DataTypes.BOOLEAN, defaultValue: true },
  enableRightClick: { type: DataTypes.BOOLEAN, defaultValue: false },
  enableRegistrations: { type: DataTypes.BOOLEAN, defaultValue: true },
  enablePracticeMode: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Sync the model just in case it's new
Setting.sync({ alter: true }).then(() => {
  // Ensure at least one setting exists
  Setting.findOrCreate({ where: { id: 1 }, defaults: {} });
});


// @route GET /api/settings
// @desc Get platform settings
router.get('/', protect, async (req, res) => {
  try {
    const settings = await Setting.findByPk(1);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/settings
// @desc Update platform settings (Admin only)
router.put('/', protect, admin, async (req, res) => {
  try {
    const settings = await Setting.findByPk(1);
    await settings.update(req.body);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/settings/security-logs
// @desc Get security violations and logs (Admin only)
router.get('/security-logs', protect, admin, async (req, res) => {
  try {
    // Get attempts with violations
    const violations = await AssessmentAttempt.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { tabSwitches: { [require('sequelize').Op.gt]: 0 } },
          { copyPasteAttempts: { [require('sequelize').Op.gt]: 0 } }
        ]
      },
      include: [
        { model: User, as: 'user', attributes: ['name', 'rollNumber', 'department'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 100
    });
    
    // In a real app we'd also include LoginSessions, but we don't have that model fully populated yet.
    // Let's just return the assessment violations.
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
