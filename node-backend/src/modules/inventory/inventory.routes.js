// รวม Route สินค้าทั้งหมด

const express = require('express');
const router = express.Router();

// Controllers
const productsController = require('./products.controller');
const categoriesController = require('./categories.controller');
const brandsController = require('./brands.controller');
const suppliersController = require('./suppliers.controller');
const auditlogRoutes = require('./auditlog.routes');
const productTypesController = require('./productTypes.controller');
// --- AuditLog (Product-specific logs) ---
router.use(auditlogRoutes);

// Middleware
const { verifyToken, checkRole, checkPermission } = require('../../middleware/auth');

// --- Products (สินค้า) ---
// ดูสินค้าทั้งหมด (Public - ไม่ต้อง login)
router.get('/products', productsController.getAllProducts);
router.get('/products/slug/:slug', productsController.getProductBySlug);
router.get('/products/:id', productsController.getProductDetail);
// เพิ่มสินค้า (ต้องมีสิทธิ์ create)
router.post('/products', verifyToken, checkPermission('products', 'create'), productsController.createProduct);
// แก้ไขข้อมูลสินค้า (ต้องมีสิทธิ์ update)
router.put('/products/:id', verifyToken, checkPermission('products', 'update'), productsController.updateProduct);
// ปรับสต็อก Manual (ต้องมีสิทธิ์ update)
router.patch('/products/stock', verifyToken, checkPermission('products', 'update'), productsController.adjustStock);
// ลบสินค้า (ต้องมีสิทธิ์ delete)
router.delete('/products/:id/hard', verifyToken, checkPermission('products', 'delete'), productsController.hardDeleteProduct);
// Toggle product flags (ต้องมีสิทธิ์ update)
router.patch('/products/:id/flags', verifyToken, checkPermission('products', 'update'), productsController.toggleProductFlags);

// --- Categories (หมวดหมู่) ---
// ดูหมวดหมู่ (Public - ไม่ต้อง login)
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', verifyToken, checkPermission('products', 'create'), categoriesController.createCategory);
router.put('/categories/:id', verifyToken, checkPermission('products', 'update'), categoriesController.updateCategory);
router.delete('/categories/:id', verifyToken, checkPermission('products', 'delete'), categoriesController.deleteCategory);

// --- Brands (ยี่ห้อ) ---
// ดูยี่ห้อ (Public - ไม่ต้อง login)
router.get('/brands', brandsController.getAllBrands);
router.post('/brands', verifyToken, checkPermission('products', 'create'), brandsController.createBrand);
router.put('/brands/:id', verifyToken, checkPermission('products', 'update'), brandsController.updateBrand);
router.delete('/brands/:id', verifyToken, checkPermission('products', 'delete'), brandsController.deleteBrand);

// --- Suppliers (คู่ค้า) ---
router.get('/suppliers', verifyToken, checkPermission('products', 'read'), suppliersController.getAllSuppliers);
router.post('/suppliers', verifyToken, checkPermission('products', 'create'), suppliersController.createSupplier);

// --- Product Types (ประเภทสินค้า) ---
// ดูประเภทสินค้า (Public - ไม่ต้อง login)
router.get('/types', productTypesController.getAllTypes);
router.post('/types', verifyToken, checkPermission('products', 'create'), productTypesController.createType);
router.put('/types/:id', verifyToken, checkPermission('products', 'update'), productTypesController.updateType);
router.delete('/types/:id', verifyToken, checkPermission('products', 'delete'), productTypesController.deleteType);

module.exports = router;