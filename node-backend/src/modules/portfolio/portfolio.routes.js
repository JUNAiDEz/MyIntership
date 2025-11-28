// รวม Route ผลงาน

const express = require('express');
const router = express.Router();

// Controllers
const projectsController = require('./projects.controller');
const categoriesController = require('./categories.controller');
const reviewsController = require('./reviews.controller');

// Middleware
const { verifyToken, checkRole } = require('../../middleware/auth');

// --- Projects (ผลงาน) ---
router.get('/projects', projectsController.getAllProjects); // ดูรายการผลงาน (มี Filter)
router.get('/projects/:id', projectsController.getProjectDetail); // ดูรายละเอียด + Gallery
// Admin Only
router.post('/projects', verifyToken, checkRole(['Admin', 'Manager']), projectsController.createProject);
router.put('/projects/:id', verifyToken, checkRole(['Admin', 'Manager']), projectsController.updateProject);
router.delete('/projects/:id', verifyToken, checkRole(['Admin', 'Manager']), projectsController.deleteProject);

// --- Categories (หมวดหมู่ผลงาน เช่น Brake Upgrade, Tuning) ---
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', verifyToken, checkRole(['Admin', 'Manager']), categoriesController.createCategory);

// --- Reviews (รีวิว) ---
// Public อ่านรีวิว
router.get('/reviews/products/:id', reviewsController.getProductReviews);
router.get('/reviews/services/:id', reviewsController.getServiceReviews);

// Customer เขียนรีวิว (ต้อง Login)
router.post('/reviews/products', verifyToken, reviewsController.createProductReview);
router.post('/reviews/services', verifyToken, reviewsController.createServiceReview);

// Admin อนุมัติรีวิว
router.patch('/reviews/:type/:id/approve', verifyToken, checkRole(['Admin', 'Manager']), reviewsController.approveReview);

module.exports = router;