const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const { protect, admin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// @route GET /api/analytics
// @desc Get analytics dashboard data
router.get('/', protect, admin, async (req, res) => {
  try {
    // 1. Basic Stats
    const totalUsers = await User.count({ where: { role: 'Member' } });
    const totalProblems = await Problem.count();
    const totalSubmissions = await Submission.count();
    
    // 2. Registrations over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const registrations = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        role: 'Member',
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // 3. Problem Difficulty Distribution
    const difficulties = await Problem.findAll({
      attributes: [
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['difficulty']
    });

    // 4. Submissions Acceptance Rate
    const acceptedSubmissions = await Submission.count({ where: { status: 'Accepted' } });
    const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

    // 5. Branch Participation
    const branches = await User.findAll({
      attributes: [
        'branch',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { role: 'Member' },
      group: ['branch']
    });

    // 6. Year-wise Participation
    const years = await User.findAll({
      attributes: [
        'year',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { role: 'Member' },
      group: ['year']
    });

    res.json({
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        acceptanceRate
      },
      charts: {
        registrations: registrations.map(r => ({
          date: new Date(r.getDataValue('date')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: parseInt(r.getDataValue('count'))
        })),
        difficulties: difficulties.map(d => ({
          name: d.difficulty,
          value: parseInt(d.getDataValue('count'))
        })),
        departments: branches.map(d => ({
          name: d.branch || 'Unknown',
          value: parseInt(d.getDataValue('count'))
        })),
        years: years.map(y => ({
          name: y.year ? `Year ${y.year}` : 'Unknown',
          value: parseInt(y.getDataValue('count'))
        }))
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
