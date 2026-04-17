const express = require('express');
const router = express.Router();

const stickerCarRoutes = require('./stickerCar.routes');
const stickerColorRoutes = require('./stickerColor.routes');

// Mount routes
router.use('/cars', stickerCarRoutes);
router.use('/colors', stickerColorRoutes);

module.exports = router;
