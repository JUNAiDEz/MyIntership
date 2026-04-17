// รวม Route ลูกค้าและรถ

const express = require('express');
const router = express.Router();

// Controllers
const customersController = require('./customers.controller');
const vehiclesController = require('./vehicles.controller');
const carMasterController = require('./carMaster.controller');

// Middleware
const { verifyToken, checkRole, checkPermission } = require('../../middleware/auth');

// --- Customers (ลูกค้า) ---
router.get('/customers', verifyToken, checkPermission('customers', 'read'), customersController.searchCustomers);
router.get('/customers/:id', verifyToken, checkPermission('customers', 'read'), customersController.getCustomerDetail);
router.put('/customers/:id', verifyToken, checkPermission('customers', 'update'), customersController.updateCustomer);

// --- Vehicles (รถยนต์ของลูกค้า) ---
router.post('/vehicles', verifyToken, checkPermission('customers', 'create'), vehiclesController.addVehicle);
router.get('/vehicles', verifyToken, checkPermission('customers', 'read'), vehiclesController.searchVehicles);
router.get('/vehicles/:id', verifyToken, checkPermission('customers', 'read'), vehiclesController.getVehicleById);
router.put('/vehicles/:id', verifyToken, checkPermission('customers', 'update'), vehiclesController.updateVehicle);

// --- Car Master Data (ยี่ห้อ/รุ่นรถ) ---
// ดูยี่ห้อ/รุ่นรถ (Public - ไม่ต้อง login)
router.get('/master/brands', carMasterController.getAllBrands);
router.get('/master/models', carMasterController.getAllModels);
router.get('/master/models/slug/:slug', carMasterController.getModelBySlug);

// เพิ่มยี่ห้อ/รุ่นรถใหม่ (ต้องมีสิทธิ์ create)
router.post('/master/brands', verifyToken, checkPermission('cars', 'create'), carMasterController.createBrand);
router.post('/master/models', verifyToken, checkPermission('cars', 'create'), carMasterController.createModel);

// แก้ไขยี่ห้อ/รุ่นรถ (ต้องมีสิทธิ์ update)
router.put('/master/brands/:id', verifyToken, checkPermission('cars', 'update'), carMasterController.updateBrand);
router.put('/master/models/:id', verifyToken, checkPermission('cars', 'update'), carMasterController.updateModel);

// ลบยี่ห้อ/รุ่นรถ (ต้องมีสิทธิ์ delete)
router.delete('/master/brands/:id', verifyToken, checkPermission('cars', 'delete'), carMasterController.deleteBrand);
router.delete('/master/models/:id', verifyToken, checkPermission('cars', 'delete'), carMasterController.deleteModel);

module.exports = router;