// dealers.routes.js
const express = require('express');
const router = express.Router();
const dealersController = require('./dealers.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// Public reads (โชว์ dealer บนเว็บสาธารณะ)
router.get('/', dealersController.getAllDealers);
router.get('/:id', dealersController.getDealerById);

// Admin writes (ต้อง auth)
router.post('/', ADMIN, dealersController.createDealer);
router.put('/:id', ADMIN, dealersController.updateDealer);
router.delete('/:id', ADMIN, dealersController.deleteDealer);

module.exports = router;
