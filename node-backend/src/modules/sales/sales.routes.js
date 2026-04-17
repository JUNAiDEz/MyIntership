// รวม Route การขาย

const express = require('express');
const router = express.Router();

// Controllers
const ordersController = require('./orders.controller');
const promotionsController = require('./promotions.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Orders (ใบสั่งซ่อม) ---
router.get('/orders', verifyToken, ordersController.getAllOrders);
router.get('/orders/:id', verifyToken, ordersController.getOrderDetail);

// เปิดบิล (พนักงาน หรือ Admin)
router.post('/orders', verifyToken, checkRole(['Admin', 'Manager', 'Technician']), ordersController.createOrder);

// อัปเดตสถานะงานซ่อม (Pending -> In_Progress -> Completed)
router.patch('/orders/:id/status', verifyToken, ordersController.updateOrderStatus);


// --- Promotions (โปรโมชั่น) ---
router.get('/promotions', promotionsController.getActivePromotions); // Public ดูได้
router.get('/promotions/slug/:slug', promotionsController.getPromotionBySlug); // ดึงด้วย slug
router.post('/promotions', verifyToken, checkRole(['Admin', 'Manager', 'HighestAdmin']), promotionsController.createPromotion);
router.put('/promotions/:id', verifyToken, checkRole(['Admin', 'Manager', 'HighestAdmin']), promotionsController.updatePromotion);
router.delete('/promotions/:id', verifyToken, checkRole(['Admin', 'Manager', 'HighestAdmin']), promotionsController.deletePromotion);
router.patch('/promotions/:id/toggle_status', verifyToken, checkRole(['Admin', 'Manager', 'HighestAdmin']), promotionsController.togglePromotionStatus);

module.exports = router;