// @desc    Get single FAQ by slug
// @route   GET /api/faq/slug/:slug
// @access  Public
exports.getFaqBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const faq = await Faq.findOne({ where: { slug } });
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Error fetching FAQ by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ by slug',
      error: error.message
    });
  }
};
const db = require('../../models');
const Faq = db.Faq;
const { Op } = require('sequelize');

// @desc    Get all FAQs (with filters)
// @route   GET /api/faq
// @access  Public
exports.getAllFaqs = async (req, res) => {
  try {
    const { category, active, search, limit = 100, offset = 0 } = req.query;

    const where = {};

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by active status
    if (active !== undefined) {
      where.is_active = active === 'true' ? 1 : 0;
    }

    // Search in question or answer
    if (search) {
      where[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } }
      ];
    }

    const faqs = await Faq.findAll({
      where,
      order: [
        ['sort_order', 'ASC'],
        ['id', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Faq.count({ where });

    res.json({
      success: true,
      data: faqs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// @desc    Get single FAQ by ID
// @route   GET /api/faq/:id
// @access  Public
exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    });
  }
};

// @desc    Create new FAQ
// @route   POST /api/faq
// @access  Private/Admin
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, sort_order, is_active } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const faq = await Faq.create({
      question,
      answer,
      category: category || 'General',
      sort_order: sort_order || 0,
      is_active: is_active !== undefined ? is_active : 1
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faq/:id
// @access  Private/Admin
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, sort_order, is_active, slug } = req.body;

    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Update fields
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (sort_order !== undefined) faq.sort_order = sort_order;
    if (is_active !== undefined) faq.is_active = is_active;
    if (slug !== undefined) faq.slug = slug;

    await faq.save();

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faq/:id
// @access  Private/Admin
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await faq.destroy();

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

// @desc    Toggle FAQ active status
// @route   PATCH /api/faq/:id/toggle-active
// @access  Private/Admin
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Toggle is_active
    faq.is_active = faq.is_active === 1 ? 0 : 1;
    await faq.save();

    res.json({
      success: true,
      message: `FAQ ${faq.is_active === 1 ? 'activated' : 'deactivated'} successfully`,
      data: faq
    });
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling FAQ status',
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/faq/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Faq.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      raw: true
    });

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};
