const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// @route GET /api/notifications
// @desc Get notifications for current user
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { targetAudience: 'Global' },
          { targetAudience: 'Department', targetValue: user.branch || null },
          { targetAudience: 'Year', targetValue: user.year ? user.year.toString() : null },
          { targetAudience: 'Individual', targetValue: user.id ? user.id.toString() : null }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/notifications
// @desc Create a notification (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/notifications/:id
// @desc Delete a notification
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
