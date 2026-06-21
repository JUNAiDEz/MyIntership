const express = require('express');
const router = express.Router();
const faqController = require('./faq.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

// admin guard ใช้ซ้ำ (ต้อง login + role ทีมงาน)
const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

router.get('/slug/:slug', faqController.getFaqBySlug);

// Public routes (อ่านได้ทุกคน)
router.get('/categories', faqController.getCategories);
router.get('/:id', faqController.getFaqById);
router.get('/', faqController.getAllFaqs);

// Admin routes (ต้อง auth)
router.post('/', ADMIN, faqController.createFaq);
router.put('/:id', ADMIN, faqController.updateFaq);
router.delete('/:id', ADMIN, faqController.deleteFaq);
router.patch('/:id/toggle-active', ADMIN, faqController.toggleActive);

module.exports = router;
