const express = require('express');
const router = express.Router();
const stickerColorController = require('./stickerColor.controller');

// Get all sticker colors
router.get('/', stickerColorController.getAllColors);

// Get single sticker color by ID
router.get('/:id', stickerColorController.getColorById);

// Create new sticker color
router.post('/', stickerColorController.createColor);

// Update sticker color
router.put('/:id', stickerColorController.updateColor);

// Delete sticker color
router.delete('/:id', stickerColorController.deleteColor);

// Update display order for multiple colors
router.put('/reorder', stickerColorController.updateDisplayOrder);

module.exports = router;
