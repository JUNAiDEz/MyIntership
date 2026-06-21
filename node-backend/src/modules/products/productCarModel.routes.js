const express = require('express');
const router = express.Router();
const productCarModelController = require('./productCarModel.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// เพิ่มหรืออัปเดตความสัมพันธ์สินค้า-รุ่นรถ (ต้อง auth)
router.post('/product-car-model', ADMIN, productCarModelController.addOrUpdateProductCarModel);

// ลบความสัมพันธ์สินค้า-รุ่นรถ (ต้อง auth)
router.delete('/product-car-model', ADMIN, productCarModelController.deleteProductCarModel);

// ดึงรุ่นรถที่ผูกกับสินค้า
router.get('/product-car-model/by-product/:product_template_id', productCarModelController.getCarModelsByProduct);

// ดึงสินค้าที่ผูกกับรุ่นรถ
router.get('/product-car-model/by-car-model/:car_model_id', productCarModelController.getProductsByCarModel);

module.exports = router;
