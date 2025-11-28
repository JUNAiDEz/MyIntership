// รวม Route บริการ

const express = require('express');
const router = express.Router();

// Controllers
const servicesController = require('./services.controller');
const pricingController = require('./pricing.controller');
const categoriesController = require('./categories.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Services (งานบริการ) ---
router.get('/services', servicesController.getAllServices); // ดูรายการบริการ
router.get('/services/:id', servicesController.getServiceDetail); // ดูรายละเอียด + อะไหล่ที่ต้องใช้

// เพิ่มบริการใหม่ (Admin/Manager)
router.post('/services', verifyToken, checkRole(['Admin', 'Manager']), servicesController.createService);
// แก้ไขบริการ (Admin/Manager)
router.put('/services/:id', verifyToken, checkRole(['Admin', 'Manager']), servicesController.updateService);
// ลบบริการ (Admin/Manager)
router.delete('/services/:id', verifyToken, checkRole(['Admin', 'Manager']), servicesController.deleteService);
// Hard delete (remove from DB) - Admin only
router.delete('/services/:id/hard', verifyToken, checkRole(['Admin', 'Manager']), servicesController.hardDeleteService);
// Toggle endpoints (mounted as /api/services/:id/...) to match frontend calls
router.patch('/:id/toggle_status', verifyToken, checkRole(['Admin', 'Manager']), servicesController.toggleStatus);
router.patch('/:id/toggle_popular', verifyToken, checkRole(['Admin', 'Manager']), servicesController.togglePopular);

// --- Pricing (ราคาตามรุ่นรถ) ---
// เช่น: เปลี่ยนผ้าเบรค Camry ราคาต่างกับ Vios
router.post('/services/calculate-price', pricingController.calculatePrice);
// ตั้งราคาเฉพาะรุ่นรถ (Admin)
router.post('/services/pricing', verifyToken, checkRole(['Admin', 'Manager']), pricingController.setServicePrice);

// --- Categories (หมวดหมู่งานซ่อม) ---
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', verifyToken, checkRole(['Admin', 'Manager']), categoriesController.createCategory);

module.exports = router;