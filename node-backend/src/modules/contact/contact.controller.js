const db = require('../../models');
const ContactMessage = db.ContactMessage;

// GET /api/contact - Get all contact messages (with filters)
exports.getAllMessages = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search } = req.query;
    
    const where = {};
    
    // Filter by status
    if (status && ['Pending', 'Read', 'Replied'].includes(status)) {
      where.status = status;
    }
    
    // Search in name, subject, or message
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const messages = await ContactMessage.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: messages.rows,
      pagination: {
        total: messages.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(messages.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact messages',
      error: error.message
    });
  }
};

// GET /api/contact/:id - Get single contact message
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByPk(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact message',
      error: error.message
    });
  }
};

// POST /api/contact - Create new contact message
exports.createMessage = async (req, res) => {
  try {
    const { user_id, name, phone_number, subject, message } = req.body;
    
    // Validation
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name and message are required'
      });
    }
    
    const newMessage = await ContactMessage.create({
      user_id: user_id || null,
      name: name.trim(),
      phone_number: phone_number ? phone_number.trim() : null,
      subject: subject ? subject.trim() : null,
      message: message.trim(),
      status: 'Pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Contact message created successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact message',
      error: error.message
    });
  }
};

// PUT /api/contact/:id - Update contact message
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, name, phone_number, subject, message } = req.body;
    
    const contactMessage = await ContactMessage.findByPk(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    // Update fields
    if (status && ['Pending', 'Read', 'Replied'].includes(status)) {
      contactMessage.status = status;
    }
    if (name) contactMessage.name = name.trim();
    if (phone_number !== undefined) contactMessage.phone_number = phone_number ? phone_number.trim() : null;
    if (subject !== undefined) contactMessage.subject = subject ? subject.trim() : null;
    if (message) contactMessage.message = message.trim();
    
    await contactMessage.save();
    
    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: contactMessage
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message',
      error: error.message
    });
  }
};

// DELETE /api/contact/:id - Delete contact message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contactMessage = await ContactMessage.findByPk(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    await contactMessage.destroy();
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
};

// PATCH /api/contact/:id/status - Update only status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['Pending', 'Read', 'Replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Read, or Replied'
      });
    }
    
    const contactMessage = await ContactMessage.findByPk(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    contactMessage.status = status;
    await contactMessage.save();
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contactMessage
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// GET /api/contact/stats - Get statistics
exports.getStats = async (req, res) => {
  try {
    const total = await ContactMessage.count();
    const pending = await ContactMessage.count({ where: { status: 'Pending' } });
    const read = await ContactMessage.count({ where: { status: 'Read' } });
    const replied = await ContactMessage.count({ where: { status: 'Replied' } });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        read,
        replied
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};
