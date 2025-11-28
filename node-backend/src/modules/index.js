const express = require('express');
const router = express.Router();

// Import Routes จากแต่ละ Module
const authRoutes = require('./auth/auth.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const serviceRoutes = require('./services/services.routes'); // เช็คชื่อไฟล์ดีๆ นะครับ (services.routes.js)
const vehicleRoutes = require('./vehicles/vehicles.routes');
const salesRoutes = require('./sales/sales.routes');
const portfolioRoutes = require('./portfolio/portfolio.routes');
const systemRoutes = require('./system/system.routes');

// --- Mount Routes ---
// กำหนด Prefix ของ URL ตรงนี้ที่เดียว (จัดการง่ายกว่าไปแก้ทีละไฟล์)

// 1. Auth & Users -> /api/auth/...
router.use('/auth', authRoutes);

// 2. Inventory (Products) -> /api/inventory/...
router.use('/inventory', inventoryRoutes);

// 3. Services -> /api/services/...
router.use('/services', serviceRoutes);

// 4. Vehicles & Customers -> /api/vehicles/...
router.use('/vehicles', vehicleRoutes);

// 5. Sales (Orders) -> /api/sales/...
router.use('/sales', salesRoutes);

// 6. Portfolio -> /api/portfolio/...
router.use('/portfolio', portfolioRoutes);

// 7. System (Logs/Uploads) -> /api/system/...
router.use('/system', systemRoutes);

module.exports = router;