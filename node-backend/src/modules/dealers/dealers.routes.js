// dealers.routes.js
const express = require('express');
const router = express.Router();
const dealersController = require('./dealers.controller');

router.post('/', dealersController.createDealer);
router.get('/', dealersController.getAllDealers);
router.get('/:id', dealersController.getDealerById);
router.put('/:id', dealersController.updateDealer);
router.delete('/:id', dealersController.deleteDealer);

module.exports = router;
