const express = require('express');
const router = express.Router();
const stickerCarController = require('./stickerCar.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// Public reads (หน้า Sticker สาธารณะใช้แสดงรถ)
router.get('/', stickerCarController.getAllCars);
router.get('/:id', stickerCarController.getCarById);

// Admin writes (ต้อง auth)
router.post('/', ADMIN, stickerCarController.createCar);
router.put('/:id', ADMIN, stickerCarController.updateCar);
router.delete('/:id', ADMIN, stickerCarController.deleteCar);

module.exports = router;
