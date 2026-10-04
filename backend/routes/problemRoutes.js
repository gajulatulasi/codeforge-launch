const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { protect, admin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// @route GET /api/problems
// @desc Get all unlocked problems (Members) or all problems (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let result;
    if (req.user.role === 'Admin') {
      result = await Problem.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
    } else {
      const now = new Date();
      result = await Problem.findAndCountAll({
        where: {
          unlockDate: {
            [Op.lte]: now
          },
          isActive: true
        },
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['hiddenSolution', 'hiddenTestcases'] },
        limit,
        offset
      });
    }
    res.json({
      data: result.rows,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/problems/:id
// @desc Get single problem
router.get('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    // Check unlock logic for members
    if (req.user.role !== 'Admin' && new Date(problem.unlockDate) > new Date()) {
       return res.status(403).json({ message: 'Problem is locked' });
    }
    
    // Hide solution from members
    if (req.user.role !== 'Admin') {
      problem.hiddenSolution = undefined;
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/problems
// @desc Create a problem (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.problemCode) {
      const count = await Problem.count();
      payload.problemCode = `PRB-${(count + 1).toString().padStart(3, '0')}`;
    }
    const problem = await Problem.create(payload);
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route POST /api/problems/:id/run
// @desc Test code against sample test cases (No permanent submission)
router.post('/:id/run', protect, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    // Simulate Code Execution against sample testcases
    let output = '';
    let success = true;

    if (!code || code.trim() === '') {
      output = 'Error: Code cannot be empty.';
      success = false;
    } else if (code.toLowerCase().includes('syntax error')) {
      output = 'SyntaxError: Unexpected token';
      success = false;
    } else {
      // Mock Success against sample cases
      output = problem.sampleTestcases.map((tc, idx) => `Test Case ${idx + 1}: Passed`).join('\n');
    }

    res.json({
      success,
      output
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/problems/:id
// @desc Update a problem (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    await problem.update(req.body);
    res.json(problem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/problems/:id
// @desc Delete a problem (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    await problem.destroy();
    res.json({ message: 'Problem removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
