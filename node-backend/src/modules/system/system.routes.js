// รวม Route ระบบ

const express = require('express');
const router = express.Router();
const upload = require('./upload.middleware'); // ตัวจัดการไฟล์

// Controllers
const auditController = require('./audit.controller');
const uploadController = require('./upload.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Audit Logs (ดูประวัติการใช้งาน) ---
// เฉพาะ Admin เท่านั้นที่ดูได้
router.get('/logs', verifyToken, checkRole(['Admin']), auditController.getAuditLogs);
router.get('/logs/:id', verifyToken, checkRole(['Admin']), auditController.getLogDetail);

// --- File Upload (อัปโหลดรูปภาพ) ---
// ต้อง Login ก่อนถึงจะอัปโหลดได้ (User ทั่วไปก็อัปได้ เช่น รูปโปรไฟล์ หรือ รีวิว)
router.post('/upload', verifyToken, upload.single('image'), uploadController.uploadFile);

module.exports = router;