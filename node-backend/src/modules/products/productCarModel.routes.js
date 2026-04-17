const express = require('express');
const router = express.Router();
const productCarModelController = require('./productCarModel.controller');

// เพิ่มหรืออัปเดตความสัมพันธ์สินค้า-รุ่นรถ
router.post('/product-car-model', productCarModelController.addOrUpdateProductCarModel);

// ลบความสัมพันธ์สินค้า-รุ่นรถ
router.delete('/product-car-model', productCarModelController.deleteProductCarModel);

// ดึงรุ่นรถที่ผูกกับสินค้า
router.get('/product-car-model/by-product/:product_template_id', productCarModelController.getCarModelsByProduct);

// ดึงสินค้าที่ผูกกับรุ่นรถ
router.get('/product-car-model/by-car-model/:car_model_id', productCarModelController.getProductsByCarModel);

module.exports = router;
