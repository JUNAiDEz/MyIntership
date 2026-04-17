const express = require('express');
const router = express.Router();
const carWrapController = require('./carWrap.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

// ==================== CAR WRAP PROFILES ====================
router.get('/profiles', carWrapController.getAllProfiles);
router.get('/profiles/car/:car_model_id', carWrapController.getProfileByCarModel);
router.post('/profiles', verifyToken, checkRole(['admin']), carWrapController.createProfile);
router.put('/profiles/:id', verifyToken, checkRole(['admin']), carWrapController.updateProfile);
router.delete('/profiles/:id', verifyToken, checkRole(['admin']), carWrapController.deleteProfile);

// ==================== WRAP FILM SERIES ====================
router.get('/series', carWrapController.getAllSeries);
router.get('/series/:id', carWrapController.getSeriesDetail);

// ==================== WRAP COLORS ====================
router.get('/series/:series_id/colors', carWrapController.getColorsBySeries);
router.post('/colors', verifyToken, checkRole(['admin']), carWrapController.createColor);

// ==================== WRAP PRICING ====================
router.get('/prices/wrap', carWrapController.getWrapPrice);
router.post('/prices/wrap', verifyToken, checkRole(['admin']), carWrapController.createWrapPrice);

// ==================== PPF SERIES ====================
router.get('/ppf/series', carWrapController.getAllPPFSeries);

// ==================== PPF PRICING ====================
router.get('/prices/ppf', carWrapController.getPPFPrice);
router.post('/prices/ppf', verifyToken, checkRole(['admin']), carWrapController.createPPFPrice);

module.exports = router;