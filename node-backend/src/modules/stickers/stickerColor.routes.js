const express = require('express');
const router = express.Router();
const stickerColorController = require('./stickerColor.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// Public reads (หน้า Sticker สาธารณะใช้แสดงสี)
router.get('/', stickerColorController.getAllColors);
router.get('/:id', stickerColorController.getColorById);

// Admin writes (ต้อง auth)
router.post('/', ADMIN, stickerColorController.createColor);
// reorder ต้องมาก่อน /:id เพื่อไม่ให้ถูกจับเป็น id='reorder'
router.put('/reorder', ADMIN, stickerColorController.updateDisplayOrder);
router.put('/:id', ADMIN, stickerColorController.updateColor);
router.delete('/:id', ADMIN, stickerColorController.deleteColor);

module.exports = router;
