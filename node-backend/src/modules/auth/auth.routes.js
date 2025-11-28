const express = require('express');
const router = express.Router();

// Controllers
const authController = require('./auth.controller');
const employeeController = require('./employees.controller');
const userController = require('./users.controller');
const roleController = require('./roles.controller');

// Middleware
// ถอย 2 ขั้นจาก src/modules/auth/ -> src/middleware/auth.js
const { verifyToken, checkRole } = require('../../middleware/auth');

// ==========================================
// Public Routes (ใครก็เข้าได้)
// ==========================================
router.post('/register', authController.register); // ลูกค้าสมัครสมาชิก
router.post('/login', authController.login);       // ล็อกอิน (ได้ทั้งลูกค้าและพนักงาน)

// ==========================================
// Private Routes (ต้อง Login ก่อน)
// ==========================================
// ดูข้อมูลส่วนตัว (ใช้ Token แนบมาใน Header)
router.get('/me', verifyToken, authController.getMe);

// ==========================================
// Admin / Manager Routes (ต้องเป็น Admin/Manager เท่านั้น)
// ==========================================
// Middleware ดักจับตั้งแต่ตรงนี้ลงไป
router.use(verifyToken, checkRole(['Admin', 'Manager'])); 

// --- จัดการพนักงาน (Employees) ---
router.post('/employees', employeeController.createEmployee);     // เพิ่มพนักงานใหม่
router.get('/employees', employeeController.getAllEmployees);     // ดูรายชื่อพนักงาน
router.put('/employees/:id', employeeController.updateEmployee);  // แก้ไขข้อมูลพนักงาน

// --- จัดการผู้ใช้งาน (Users) ---
router.get('/users', userController.getAllUsers);                 // ดู User ทั้งหมดในระบบ
router.patch('/users/:id/status', userController.toggleUserStatus); // แบน/ปลดแบน User

// --- จัดการบทบาท (Roles) ---
router.get('/roles', roleController.getAllRoles);                 // ดึงข้อมูล Role มาโชว์ใน Dropdown

module.exports = router;