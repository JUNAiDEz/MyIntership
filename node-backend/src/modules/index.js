const express = require('express');
const router = express.Router();

// Import Routes จากแต่ละ Module
const authRoutes = require('./auth/auth.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const serviceRoutes = require('./services/services.routes'); 
const vehicleRoutes = require('./vehicles/vehicles.routes');
const salesRoutes = require('./sales/sales.routes');
const portfolioRoutes = require('./portfolio/portfolio.routes');
const systemRoutes = require('./system/system.routes');
const blogRoutes = require('./blog/blog.routes');
const faqRoutes = require('./faq/faq.routes');
const contactRoutes = require('./contact/contact.routes');
const carWrapRoutes = require('./carWrap/carWrap.routes');
const stickerRoutes = require('./stickers');
const dealersRoutes = require('./dealers/dealers.routes');

// 👇 Import Module ใหม่ที่คุณต้องการ
const servicePreviewRoutes = require('./servicePreview/servicePreview.routes');
const productCarModelRoutes = require('./products/productCarModel.routes');

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

// 7. Blog -> /api/blog/...
router.use('/blog', blogRoutes);

// 8. FAQ -> /api/faq/...
router.use('/faq', faqRoutes);

// 9. Contact -> /api/contact/...
router.use('/contact', contactRoutes);

// 10. Car Wrap & PPF -> /api/car-wrap/...
router.use('/car-wrap', carWrapRoutes);

// 11. Sticker Management -> /api/stickers/...
router.use('/stickers', stickerRoutes);

// 12. System (Logs/Uploads) -> /api/system/...
router.use('/system', systemRoutes);

// 🚗 13. ProductCarModel Management -> /api/products/product-car-model/...
router.use('/products', productCarModelRoutes);

// 🚀 14. Service Preview Management -> /api/service-preview/...
router.use('/service-preview', servicePreviewRoutes);

// 🚙 15. Dealers Management -> /api/dealers/...
router.use('/dealers', dealersRoutes);

module.exports = router;