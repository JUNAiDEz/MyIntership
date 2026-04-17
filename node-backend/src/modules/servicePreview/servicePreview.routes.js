// src/modules/servicePreview/servicePreview.routes.js
const express = require('express');
const router = express.Router();
const previewController = require('./servicePreview.controller');

// แก้จุดนี้: ดึงเฉพาะฟังก์ชัน verifyToken ออกมาจากไฟล์ auth.js
const { verifyToken } = require('../../middleware/auth');

// เส้นทางสำหรับ Admin จัดการ
// เปลี่ยนจาก auth เป็น verifyToken ให้ตรงกับที่ import มาข้างบน
router.post('/save', verifyToken, previewController.savePreviewConfig);

// เส้นทางสำหรับดึงข้อมูล (หน้าบ้านหรือหน้า Preview)
router.get('/:id', previewController.getPreviewConfig);

module.exports = router;