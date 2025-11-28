// รวม Route สินค้าทั้งหมด

const express = require('express');
const router = express.Router();

// Controllers
const productsController = require('./products.controller');
const categoriesController = require('./categories.controller');
const brandsController = require('./brands.controller');
const suppliersController = require('./suppliers.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Products (สินค้า) ---
router.get('/products', productsController.getAllProducts); // ค้นหา + ดูทั้งหมด
router.get('/products/:id', productsController.getProductDetail); // ดูรายละเอียดเจาะจง
// เพิ่มสินค้า (Admin/Manager เท่านั้น)
router.post('/products', verifyToken, checkRole(['Admin', 'Manager']), productsController.createProduct);
// แก้ไขข้อมูลสินค้า (Admin/Manager)
router.put('/products/:id', verifyToken, checkRole(['Admin', 'Manager']), productsController.updateProduct);
// ปรับสต็อก Manual
router.patch('/products/stock', verifyToken, checkRole(['Admin', 'Manager']), productsController.adjustStock);
// Hard delete product (remove from DB)
router.delete('/products/:id/hard', verifyToken, checkRole(['Admin', 'Manager']), productsController.hardDeleteProduct);
// Toggle product flags (popular / active)
router.patch('/products/:id/flags', verifyToken, checkRole(['Admin', 'Manager']), productsController.toggleProductFlags);

// --- Categories (หมวดหมู่) ---
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', verifyToken, checkRole(['Admin', 'Manager']), categoriesController.createCategory);

// --- Brands (ยี่ห้อ) ---
router.get('/brands', brandsController.getAllBrands);
router.post('/brands', verifyToken, checkRole(['Admin', 'Manager']), brandsController.createBrand);

// --- Suppliers (คู่ค้า) ---
router.get('/suppliers', suppliersController.getAllSuppliers);
router.post('/suppliers', verifyToken, checkRole(['Admin', 'Manager']), suppliersController.createSupplier);

module.exports = router;