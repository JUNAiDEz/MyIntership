const express = require('express');
const router = express.Router();
const stickerCarController = require('./stickerCar.controller');

// Get all sticker cars
router.get('/', stickerCarController.getAllCars);

// Get single sticker car by ID
router.get('/:id', stickerCarController.getCarById);

// Create new sticker car
router.post('/', stickerCarController.createCar);

// Update sticker car
router.put('/:id', stickerCarController.updateCar);

// Delete sticker car
router.delete('/:id', stickerCarController.deleteCar);

module.exports = router;
