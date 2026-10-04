const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { protect, admin } = require('../middleware/authMiddleware');
const Problem = require('../models/Problem');
const MCQ = require('../models/MCQ');
const Submission = require('../models/Submission');
const AssessmentAttempt = require('../models/AssessmentAttempt');

// @route GET /api/users/roll/:rollNumber
// @desc Get user profile and stats by roll number
router.get('/roll/:rollNumber', protect, admin, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const user = await User.findOne({ 
      where: { rollNumber },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Student not found with this Roll Number' });
    }

    const submissions = await Submission.findAll({ where: { userId: user.id } });
    const uniqueAttempted = new Set(submissions.map(s => s.problemId)).size;
    const attempts = await AssessmentAttempt.findAll({ where: { userId: user.id } });
    
    res.json({
      profile: user,
      stats: {
        totalSubmissions: submissions.length,
        uniqueProblemsAttempted: uniqueAttempted,
        mcqsAttempted: attempts.length,
        securityViolations: attempts.reduce((acc, a) => acc + (a.tabSwitches || 0) + (a.copyPasteAttempts || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/leaderboard
// @desc Get top users by points with filters
router.get('/leaderboard', async (req, res) => {
  try {
    const { department, year, timeframe } = req.query;
    const where = { role: 'Member', accountStatus: 'APPROVED' };
    
    if (department && department !== 'All') where.department = department;
    if (year && year !== 'All') where.year = year;
    
    // For weekly/monthly timeframe, we ideally need to sum points in that period.
    // For simplicity without a complex transaction history table, we return standard points 
    // but we can filter who has been active in that timeframe.
    // In a real production system, you'd calculate this from a `PointsLog` table.
    if (timeframe === 'Weekly') {
      const { Op } = require('sequelize');
      const d = new Date();
      d.setDate(d.getDate() - 7);
      where.updatedAt = { [Op.gte]: d };
    } else if (timeframe === 'Monthly') {
      const { Op } = require('sequelize');
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      where.updatedAt = { [Op.gte]: d };
    }

    const users = await User.findAll({
      where,
      order: [
        ['points', 'DESC'],
        ['currentStreak', 'DESC']
      ],
      attributes: ['id', 'name', 'points', 'currentStreak', 'department', 'year', 'completedProblems'],
      limit: 100
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/users/profile
// @desc Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Only allow updating certain fields
    const { name, department, year, mobileNumber } = req.body;
    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/users/password
// @desc Change user password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify old password (support bcrypt or legacy plaintext)
    const bcrypt = require('bcryptjs');
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } catch (e) {
      isMatch = false;
    }
    if (!isMatch && user.password === currentPassword) {
      isMatch = true;
    }
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });
    
    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/approvals
// @desc Get all users waiting for approval
router.get('/approvals', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { accountStatus: 'PENDING' },
      attributes: ['id', 'name', 'email', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/users/approve/:id
// @desc Approve a user
router.put('/approve/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = 'APPROVED';
    await user.save();
    res.json({ message: 'User approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/users/reject/:id
// @desc Reject a user
router.put('/reject/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = 'REJECTED';
    await user.save();
    res.json({ message: 'User rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users
// @desc Get all users (Admin only) with search and filters
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Build where clause from query params
    const where = { role: 'Member' }; // Usually only want to manage members
    if (req.query.branch) where.branch = req.query.branch;
    if (req.query.year) where.year = req.query.year;
    
    // Add Search logic if searchQuery is provided
    if (req.query.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/users/:id/block
// @desc Block or unblock a user (Admin only)
router.put('/:id/block', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/users/:id
// @desc Delete a user (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/stats/platform
// @desc Get platform statistics for admin dashboard
router.get('/stats/platform', protect, admin, async (req, res) => {
  try {
    const totalPending = await User.count({ where: { accountStatus: 'PENDING' } });
    const totalApproved = await User.count({ where: { role: 'Member', accountStatus: 'APPROVED' } });
    const totalRejected = await User.count({ where: { accountStatus: 'REJECTED' } });
    const totalProblems = await Problem.count();
    const totalMCQs = await MCQ.count();
    const totalSubmissions = await Submission.count();
    
    // For Active Users we can just return a dummy or count recently active. We'll return 0 for now as it needs a session system.
    const activeUsers = 0;

    res.json({
      totalPending,
      totalApproved,
      totalRejected,
      activeUsers,
      totalProblems,
      totalMCQs,
      totalSubmissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/stats/:id
// @desc Get user stats
router.get('/stats/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/me/progress
// @desc Get current user's progress and stats
router.get('/me/progress', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Total coding problems
    const totalProblems = await Problem.count({ where: { isActive: true } });
    
    // Submissions for this user
    const submissions = await Submission.findAll({ where: { userId } });
    
    const problemsAttempted = new Set(submissions.map(s => s.problemId)).size;
    
    // Note: since the rule is 1 submission only, if it exists and status is accepted
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
    const problemsSolved = acceptedSubmissions.length;
    const remainingProblems = totalProblems - problemsSolved;
    
    // For MCQs, we don't have an McqAttempt model yet. If not created, let's just return 0 for now
    const totalMCQsAttempted = 0;
    const averageMCQScore = 0;
    
    const accuracyPercentage = problemsAttempted > 0 ? Math.round((problemsSolved / problemsAttempted) * 100) : 0;
    
    // Daily Activity over last 7 days for charts
    const { Op } = require('sequelize');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSubmissions = await Submission.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      order: [['createdAt', 'ASC']]
    });
    
    // Format daily activity
    const dailyActivityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyActivityMap[dateStr] = 0;
    }
    
    recentSubmissions.forEach(sub => {
      const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
      if (dailyActivityMap[dateStr] !== undefined) {
        dailyActivityMap[dateStr]++;
      }
    });
    
    const weeklyActivity = Object.keys(dailyActivityMap).map(date => ({
      date: date.substring(5), // MM-DD
      submissions: dailyActivityMap[date]
    }));

    // Difficulty breakdown (Need to join with Problem table)
    const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };
    for (let sub of acceptedSubmissions) {
      const prob = await Problem.findByPk(sub.problemId);
      if (prob) {
        difficultyMap[prob.difficulty]++;
      }
    }
    const difficultyData = [
      { name: 'Easy', value: difficultyMap.Easy, fill: '#4ade80' },
      { name: 'Medium', value: difficultyMap.Medium, fill: '#fbbf24' },
      { name: 'Hard', value: difficultyMap.Hard, fill: '#f87171' }
    ];
    
    res.json({
      totalCodingProblems: totalProblems,
      problemsAttempted,
      problemsSolved,
      remainingProblems,
      totalMCQsAttempted,
      averageMCQScore,
      accuracyPercentage,
      weeklyActivity,
      difficultyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
