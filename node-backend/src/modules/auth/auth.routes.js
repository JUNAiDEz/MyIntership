const express = require('express');
const router = express.Router();

// Controllers
const authController = require('./auth.controller');
const employeeController = require('./employees.controller');
const userController = require('./users.controller');
const roleController = require('./roles.controller');
const permissionController = require('./permissions.controller');
const userPermissionController = require('./userPermissions.controller');

// Middleware
// ถอย 2 ขั้นจาก src/modules/auth/ -> src/middleware/auth.js
const { verifyToken, checkRole } = require('../../middleware/auth');
const rateLimit = require('express-rate-limit');

// กัน brute-force: จำกัดการพยายาม login/register ต่อ IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10,                  // สูงสุด 10 ครั้ง/IP/หน้าต่างเวลา
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ==========================================
// Public Routes (ใครก็เข้าได้)
// ==========================================
router.post('/register', authLimiter, authController.register); // ลูกค้าสมัครสมาชิก
router.post('/login', authLimiter, authController.login);       // ล็อกอิน (ได้ทั้งลูกค้าและพนักงาน)

// ==========================================
// Private Routes (ต้อง Login ก่อน)
// ==========================================
// ดูข้อมูลส่วนตัว (ใช้ Token แนบมาใน Header)
router.get('/me', verifyToken, authController.getMe);

// ==========================================
// HighestAdmin Only Routes (เฉพาะ HighestAdmin เท่านั้น)
// ==========================================
// --- จัดการพนักงาน (Employees) - เฉพาะ HighestAdmin ---
router.post('/employees', verifyToken, checkRole(['HighestAdmin']), employeeController.createEmployee);     // เพิ่มพนักงานใหม่
router.put('/employees/:id', verifyToken, checkRole(['HighestAdmin']), employeeController.updateEmployee);  // แก้ไขข้อมูลพนักงาน

// --- จัดการผู้ใช้งาน (Users) - เฉพาะ HighestAdmin ---
router.get('/users', verifyToken, checkRole(['HighestAdmin']), userController.getAllUsers);                 // ดู User ทั้งหมดในระบบ
router.patch('/users/:id/status', verifyToken, checkRole(['HighestAdmin']), userController.toggleUserStatus); // แบน/ปลดแบน User

// ==========================================
// Admin / Manager Routes (Admin/Manager สามารถดูข้อมูลได้)
// ==========================================
router.use(verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])); 

// --- ดูรายชื่อพนักงาน (ทุก Role ดูได้) ---
router.get('/employees', employeeController.getAllEmployees);     // ดูรายชื่อพนักงาน

// --- จัดการบทบาท (Roles) ---
router.get('/roles', roleController.getAllRoles);                 // ดึงข้อมูล Role ทั้งหมด
router.get('/roles/:id', roleController.getRoleWithPermissions);  // ดึง Role + Permissions
router.post('/roles', roleController.createRole);                 // สร้าง Role ใหม่
router.put('/roles/:id', roleController.updateRole);              // แก้ไข Role
router.delete('/roles/:id', roleController.deleteRole);           // ลบ Role

// --- จัดการสิทธิ์ (Permissions) ---
router.get('/permissions', permissionController.getAllPermissions);              // ดึง Permissions ทั้งหมด
router.post('/permissions', permissionController.createPermission);              // สร้าง Permission ใหม่
router.delete('/permissions/:id', permissionController.deletePermission);        // ลบ Permission
router.post('/permissions/seed', permissionController.seedPermissions);          // เพิ่ม Permissions เริ่มต้น

router.get('/roles/:roleId/permissions', permissionController.getRolePermissions);           // ดึง Permissions ของ Role
router.post('/roles/:roleId/permissions', permissionController.assignPermissionsToRole);     // กำหนด Permissions ให้ Role (Table)
router.put('/roles/:roleId/permissions-json', permissionController.updateRolePermissionsJson); // อัพเดต Permissions (JSON)

// --- จัดการสิทธิ์รายบุคคล (User Permissions) ---
router.get('/users/:userId/permissions', userPermissionController.getUserPermissions);           // ดึงสิทธิ์ของผู้ใช้
router.post('/users/:userId/permissions', userPermissionController.assignPermissionsToUser);     // กำหนดสิทธิ์ให้ผู้ใช้ (แทนที่ทั้งหมด)
router.post('/users/:userId/permissions/add', userPermissionController.addPermissionToUser);     // เพิ่มสิทธิ์ให้ผู้ใช้
router.delete('/users/:userId/permissions/:permissionId', userPermissionController.removePermissionFromUser); // ลบสิทธิ์
router.delete('/users/:userId/permissions', userPermissionController.clearUserPermissions);      // ลบสิทธิ์ทั้งหมด

module.exports = router;