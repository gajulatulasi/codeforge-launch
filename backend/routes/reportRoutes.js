const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const LoginSession = require('../models/LoginSession');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Submission = require('../models/Submission');
const { protect, admin } = require('../middleware/authMiddleware');

// All endpoints require admin access
router.use(protect);
router.use(admin);

// @route GET /api/reports/all-students
// @desc Get all students report
router.get('/all-students', async (req, res) => {
  try {
    const { branch, year, accountStatus } = req.query;
    
    let whereClause = { role: 'Member' };
    if (branch) whereClause.branch = branch;
    if (year) whereClause.year = year;
    if (accountStatus) whereClause.accountStatus = accountStatus;

    const students = await User.findAll({
      where: whereClause,
      attributes: [
        'id', 'rollNumber', 'name', 'branch', 'year', 'email', 'accountStatus', 
        'lastActive', 'points', 'completedProblems'
      ]
    });

    // We also need total attempted from Submission model
    const results = await Promise.all(students.map(async (student) => {
      const submissions = await Submission.findAll({ where: { userId: student.id } });
      const uniqueAttempted = new Set(submissions.map(s => s.problemId)).size;
      
      const mcqAttempts = await AssessmentAttempt.count({ where: { userId: student.id } });
      const avgScore = mcqAttempts > 0 ? await AssessmentAttempt.sum('score', { where: { userId: student.id } }) / mcqAttempts : 0;

      return {
        id: student.id,
        rollNumber: student.rollNumber || 'N/A',
        name: student.name,
        branch: student.branch || 'N/A',
        year: student.year || 'N/A',
        email: student.email,
        accountStatus: student.accountStatus,
        lastLogin: student.lastActive,
        problemsAttempted: uniqueAttempted,
        problemsSolved: student.completedProblems ? student.completedProblems.length : 0,
        mcqsAttempted: mcqAttempts,
        averageMcqScore: Math.round(avgScore),
        points: student.points
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/weekly-activity
router.get('/weekly-activity', async (req, res) => {
  try {
    // Simple mock for now - would calculate based on Date range in production
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
       dateFilter = { createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] } };
    }

    const students = await User.findAll({ where: { role: 'Member' } });
    
    const results = await Promise.all(students.map(async (student) => {
      const submissions = await Submission.findAll({ 
        where: { userId: student.id, ...dateFilter } 
      });
      const solved = submissions.filter(s => s.status === 'Accepted').length;

      const sessions = await LoginSession.findAll({ where: { userId: student.id, ...dateFilter } });
      const totalTime = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

      const attempts = await AssessmentAttempt.findAll({ where: { userId: student.id, ...dateFilter } });
      const tabSwitches = attempts.reduce((acc, a) => acc + (a.tabSwitches || 0), 0);
      const copyAttempts = attempts.reduce((acc, a) => acc + (a.copyPasteAttempts || 0), 0);

      return {
        name: student.name,
        problemsAttempted: submissions.length,
        problemsSolved: solved,
        mcqsAttempted: attempts.length,
        loginCount: sessions.length,
        totalActiveTime: totalTime,
        tabSwitches,
        copyAttempts
      };
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/monthly-performance
router.get('/monthly-performance', async (req, res) => {
  // Similar aggregation logic...
  try {
    const students = await User.findAll({ where: { role: 'Member' }, order: [['points', 'DESC']] });
    
    const results = await Promise.all(students.map(async (student, index) => {
       const submissions = await Submission.findAll({ where: { userId: student.id } });
       const codingAccuracy = submissions.length > 0 
           ? Math.round((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100) 
           : 0;

       return {
         name: student.name,
         totalProblemsSolved: student.completedProblems ? student.completedProblems.length : 0,
         codingAccuracy: `${codingAccuracy}%`,
         leaderboardPosition: index + 1,
         points: student.points
       };
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/login-activity
router.get('/login-activity', async (req, res) => {
  try {
    const sessions = await LoginSession.findAll({
      include: [{ model: User, attributes: ['name', 'rollNumber'] }],
      order: [['loginTime', 'DESC']],
      limit: 100
    });
    
    const results = sessions.map(s => ({
      name: s.User ? s.User.name : 'Unknown',
      rollNumber: s.User ? s.User.rollNumber : 'N/A',
      loginTime: s.loginTime,
      logoutTime: s.logoutTime,
      duration: s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s` : 'N/A',
      ipAddress: s.ipAddress,
      browser: s.browser
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/security
router.get('/security', async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.findAll({
      where: {
        [Op.or]: [
          { tabSwitches: { [Op.gt]: 0 } },
          { copyPasteAttempts: { [Op.gt]: 0 } }
        ]
      },
      include: [{ model: User, attributes: ['name', 'rollNumber'] }],
      order: [['createdAt', 'DESC']]
    });

    const results = attempts.map(a => ({
      name: a.User ? a.User.name : 'Unknown',
      rollNumber: a.User ? a.User.rollNumber : 'N/A',
      assessmentId: a.assessmentId,
      tabSwitches: a.tabSwitches,
      copyAttempts: a.copyPasteAttempts,
      status: a.status,
      date: a.createdAt
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reports/student/:rollNumber
router.get('/student/:rollNumber', async (req, res) => {
  try {
    let { rollNumber } = req.params;
    
    // In case the admin accidentally enters an email address, extract the roll number
    if (rollNumber.includes('@')) {
      rollNumber = rollNumber.split('@')[0].toUpperCase();
    }

    const student = await User.findOne({ where: { rollNumber, role: 'Member' } });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found with that Roll Number' });
    }

    const submissions = await Submission.findAll({ where: { userId: student.id } });
    const solved = submissions.filter(s => s.status === 'Accepted').length;
    const uniqueAttempted = new Set(submissions.map(s => s.problemId)).size;

    const sessions = await LoginSession.findAll({ where: { userId: student.id } });
    const totalTime = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

    const attempts = await AssessmentAttempt.findAll({ where: { userId: student.id } });
    const tabSwitches = attempts.reduce((acc, a) => acc + (a.tabSwitches || 0), 0);
    const copyAttempts = attempts.reduce((acc, a) => acc + (a.copyPasteAttempts || 0), 0);
    const avgScore = attempts.length > 0 ? (attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length) : 0;

    const result = [{
      rollNumber: student.rollNumber,
      name: student.name,
      branch: student.branch || 'N/A',
      year: student.year || 'N/A',
      status: student.accountStatus,
      problemsAttempted: uniqueAttempted,
      problemsSolved: solved,
      mcqsAttempted: attempts.length,
      averageMcqScore: Math.round(avgScore),
      loginCount: sessions.length,
      totalActiveTime: totalTime,
      securityViolations: tabSwitches + copyAttempts,
      points: student.points
    }];

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
