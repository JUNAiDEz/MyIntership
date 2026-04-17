const express = require('express');
const router = express.Router();
const faqController = require('./faq.controller');
router.get('/slug/:slug', faqController.getFaqBySlug);
// const { protect, adminOnly } = require('../../middleware/auth');

// Public routes
router.get('/categories', faqController.getCategories);
router.get('/:id', faqController.getFaqById);
router.get('/', faqController.getAllFaqs);

// Admin routes (uncomment when auth is ready)
// router.post('/', protect, adminOnly, faqController.createFaq);
// router.put('/:id', protect, adminOnly, faqController.updateFaq);
// router.delete('/:id', protect, adminOnly, faqController.deleteFaq);
// router.patch('/:id/toggle-active', protect, adminOnly, faqController.toggleActive);

// Temporary routes without auth for development
router.post('/', faqController.createFaq);
router.put('/:id', faqController.updateFaq);
router.delete('/:id', faqController.deleteFaq);
router.patch('/:id/toggle-active', faqController.toggleActive);

module.exports = router;
