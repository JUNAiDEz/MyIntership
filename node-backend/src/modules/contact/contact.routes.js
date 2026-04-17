const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
// const { authenticateToken } = require('../../middleware/auth');

// Public route - Submit contact form
router.post('/', contactController.createMessage);

// Admin routes - Manage contact messages
// (Comment out auth middleware for development)
router.get('/stats', /* authenticateToken, */ contactController.getStats);
router.get('/:id', /* authenticateToken, */ contactController.getMessageById);
router.get('/', /* authenticateToken, */ contactController.getAllMessages);
router.put('/:id', /* authenticateToken, */ contactController.updateMessage);
router.delete('/:id', /* authenticateToken, */ contactController.deleteMessage);
router.patch('/:id/status', /* authenticateToken, */ contactController.updateStatus);

module.exports = router;
