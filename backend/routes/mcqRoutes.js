const express = require('express');
const router = express.Router();
const MCQ = require('../models/MCQ');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/mcqs
// @desc Get all MCQs
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = req.user.role === 'Admin' ? {} : { isActive: true };

    const { count, rows } = await MCQ.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Hide correctOption from non-admins
    if (req.user.role !== 'Admin') {
      const sanitizedMcqs = rows.map(mcq => {
        const mcqJson = mcq.toJSON();
        delete mcqJson.correctOption;
        return mcqJson;
      });
      return res.json({
        data: sanitizedMcqs,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    }

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

// @route POST /api/mcqs
// @desc Create an MCQ (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const mcq = await MCQ.create(req.body);
    res.status(201).json(mcq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/mcqs/:id
// @desc Delete an MCQ (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const mcq = await MCQ.findByPk(req.params.id);
    if (!mcq) return res.status(404).json({ message: 'MCQ not found' });
    await mcq.destroy();
    res.json({ message: 'MCQ removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
