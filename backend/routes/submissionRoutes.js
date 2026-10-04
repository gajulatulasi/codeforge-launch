const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/submissions
// @desc Submit code and evaluate
router.post('/', protect, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const problem = await Problem.findByPk(problemId);
    
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Mock evaluation logic
    let status = 'Accepted';
    if (!code || code.trim() === '') status = 'Failed';
    else if (code.toLowerCase().includes('syntax error')) status = 'Failed';

    const submission = await Submission.create({
      userId: req.user.id,
      problemId,
      code,
      language,
      status
    });

    if (status === 'Accepted') {
      const user = await User.findByPk(req.user.id);
      
      // Get completed problems or initialize array
      const completedProblems = user.completedProblems || [];
      
      // Update points and streak if not already solved
      if (!completedProblems.includes(problemId)) {
        completedProblems.push(problemId);
        user.completedProblems = completedProblems;
        // Tell Sequelize this JSON array has changed
        user.changed('completedProblems', true);
        
        let pointsEarned = problem.marks || 10;
        
        user.points += pointsEarned;
        
        // Streak logic
        const today = new Date().setHours(0, 0, 0, 0);
        const lastActiveDate = user.lastActive ? new Date(user.lastActive).setHours(0, 0, 0, 0) : null;
        
        if (lastActiveDate === today) {
          // Already solved today, no streak increment
        } else if (lastActiveDate === today - 86400000) {
          // Solved yesterday, increment streak
          user.currentStreak += 1;
        } else {
          // Missed a day or first time, reset streak
          user.currentStreak = 1;
        }
        
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        
        user.lastActive = new Date();
        await user.save();
      }
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/submissions/me
// @desc Get user submissions
router.get('/me', protect, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Problem,
        attributes: ['title', 'day', 'difficulty']
      }]
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
