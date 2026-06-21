const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

// admin guard (ข้อความติดต่อเป็นข้อมูลส่วนบุคคล — อ่าน/แก้ได้เฉพาะทีมงาน)
const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// Public route - Submit contact form (ลูกค้าส่งข้อความ)
router.post('/', contactController.createMessage);

// Admin routes - Manage contact messages (ต้อง auth)
router.get('/stats', ADMIN, contactController.getStats);
router.get('/:id', ADMIN, contactController.getMessageById);
router.get('/', ADMIN, contactController.getAllMessages);
router.put('/:id', ADMIN, contactController.updateMessage);
router.delete('/:id', ADMIN, contactController.deleteMessage);
router.patch('/:id/status', ADMIN, contactController.updateStatus);

module.exports = router;
