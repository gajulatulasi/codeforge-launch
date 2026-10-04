const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/assessments
// @desc Get all assessments
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await Assessment.findAndCountAll({
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

// @route POST /api/assessments
// @desc Create an assessment (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.assessmentCode) {
      const count = await Assessment.count();
      payload.assessmentCode = `ASM-${(count + 1).toString().padStart(3, '0')}`;
    }
    const assessment = await Assessment.create(payload);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route PUT /api/assessments/:id
// @desc Update an assessment (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const assessment = await Assessment.findByPk(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    await assessment.update(req.body);
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/assessments/:id
// @desc Delete an assessment (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const assessment = await Assessment.findByPk(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    await assessment.destroy();
    res.json({ message: 'Assessment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
