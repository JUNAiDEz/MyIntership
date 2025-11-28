// รวม Route ลูกค้าและรถ

const express = require('express');
const router = express.Router();

// Controllers
const customersController = require('./customers.controller');
const vehiclesController = require('./vehicles.controller');
const carMasterController = require('./carMaster.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Customers (ลูกค้า) ---
router.get('/customers', verifyToken, customersController.searchCustomers); // ค้นหาด้วยชื่อ/เบอร์
router.get('/customers/:id', verifyToken, customersController.getCustomerDetail); // ดูข้อมูล + รถที่มี
router.put('/customers/:id', verifyToken, customersController.updateCustomer); // แก้ไขที่อยู่/เบอร์

// --- Vehicles (รถยนต์ของลูกค้า) ---
router.post('/vehicles', verifyToken, vehiclesController.addVehicle); // เพิ่มรถใหม่ให้ลูกค้า
router.get('/vehicles', verifyToken, vehiclesController.searchVehicles); // ค้นหาทะเบียนรถ
router.get('/vehicles/:id', verifyToken, vehiclesController.getVehicleById); // ดูรายละเอียดรถ
router.put('/vehicles/:id', verifyToken, vehiclesController.updateVehicle); // แก้ไขข้อมูลรถ (เช่น สี, VIN)

// --- Car Master Data (ยี่ห้อ/รุ่นรถ) ---
// Public หรือ User ทั่วไปดูได้ (เพื่อเอาไปใส่ Dropdown)
router.get('/master/brands', carMasterController.getAllBrands);
router.get('/master/models', carMasterController.getAllModels); // ?brand_id=1

// Admin เท่านั้นที่เพิ่มรุ่นรถใหม่ได้
router.post('/master/brands', verifyToken, checkRole(['Admin']), carMasterController.createBrand);
router.post('/master/models', verifyToken, checkRole(['Admin']), carMasterController.createModel);
// Admin: update / delete
router.put('/master/brands/:id', verifyToken, checkRole(['Admin']), carMasterController.updateBrand);
router.delete('/master/brands/:id', verifyToken, checkRole(['Admin']), carMasterController.deleteBrand);

router.put('/master/models/:id', verifyToken, checkRole(['Admin']), carMasterController.updateModel);
router.delete('/master/models/:id', verifyToken, checkRole(['Admin']), carMasterController.deleteModel);

module.exports = router;