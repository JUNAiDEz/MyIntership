
const express = require('express');
const router = express.Router(); // 1. ต้องประกาศ router เป็นสิ่งแรก

// Controllers
const servicesController = require('./services.controller');
const pricingController = require('./pricing.controller');
const categoriesController = require('./categories.controller');


router.get('/exhaust/pricing', servicesController.getExhaustPricing);
router.get('/film-protect/pricing', servicesController.getFilmProtectPricing);
router.get('/boost-gauge/pricing', servicesController.getBoostGaugePricing);
router.get('/valve-service/pricing', servicesController.getValveServicePricing);
router.get('/sticker/pricing', servicesController.getStickerPricing);

// --- Services (งานบริการ) ---

// 1. Special Routes (ต้องวางไว้ก่อน /services/:id เสมอ ไม่งั้นโค้ดจะนึกว่า 'pipe-clean' คือ id)

router.get('/turbo-inter/pricing', servicesController.getTurboInterPricing);

// --- Services (งานบริการ) ---

// 1. Special Routes (ต้องวางไว้ก่อน /services/:id เสมอ ไม่งั้นโค้ดจะนึกว่า 'pipe-clean' คือ id)

router.get('/remote-control/pricing', servicesController.getRemoteControlPricing);

// Middleware
const { verifyToken, checkRole, checkPermission } = require('../../middleware/auth');

// --- Services (งานบริการ) ---

// 1. Special Routes (ต้องวางไว้ก่อน /services/:id เสมอ ไม่งั้นโค้ดจะนึกว่า 'pipe-clean' คือ id)

router.get('/fluid-change/pricing', servicesController.getFluidChangePricing);
router.get('/pipe-clean/pricing', servicesController.getPipeCleanPricing);
router.get('/aircon/pricing', servicesController.getAirConPricing);
router.get('/engine-spa/pricing', servicesController.getEngineSpaPricing);
router.get('/alignment/pricing', servicesController.getAlignmentPricing);
router.get('/ball-joints/pricing', servicesController.getBallJointsPricing);
router.get('/shock-absorber/pricing', servicesController.getShockAbsorberPricing);
router.get('/suspension/pricing', servicesController.getSuspensionPricing);
router.get('/wheels-tires/pricing', servicesController.getWheelsTiresPricing);
router.post('/calculate-price', verifyToken, checkPermission('services', 'read'), pricingController.calculatePrice);
router.post('/pricing', verifyToken, checkPermission('services', 'update'), pricingController.setServicePrice);
router.patch('/pricing', verifyToken, checkPermission('services', 'update'), pricingController.setServicePrice);
router.get('/upgrade/pricing', servicesController.getUpgradePricing);
router.get('/custom-exhaust/pricing', servicesController.getCustomExhaustPricing);
router.get('/remap/pricing', servicesController.getRemapPricing);


// 2. Public List & Detail
router.get('/', servicesController.getAllServices);
router.get('/:id', servicesController.getServiceDetail);

// 3. Protected CRUD Operations
router.post('/', verifyToken, checkPermission('services', 'create'), servicesController.createService);
router.put('/:id', verifyToken, checkPermission('services', 'update'), servicesController.updateService);
router.delete('/:id', verifyToken, checkPermission('services', 'delete'), servicesController.deleteService);
router.delete('/:id/hard', verifyToken, checkPermission('services', 'delete'), servicesController.hardDeleteService);

// 4. Toggle Actions
router.patch('/:id/toggle_status', verifyToken, checkPermission('services', 'update'), servicesController.toggleStatus);
router.patch('/:id/toggle_popular', verifyToken, checkPermission('services', 'update'), servicesController.togglePopular);


// --- Categories (หมวดหมู่งานซ่อม) ---
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', verifyToken, checkPermission('services', 'create'), categoriesController.createCategory);

module.exports = router;