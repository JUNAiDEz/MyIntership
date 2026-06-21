const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
const { verifyToken, checkRole } = require('../../middleware/auth');

// admin guard ใช้ซ้ำ (ต้อง login + role ทีมงาน)
const ADMIN = [verifyToken, checkRole(['HighestAdmin', 'Admin', 'Manager'])];

// Public routes (published posts only)
router.get('/', blogController.getAllPosts);
router.get('/:idOrSlug', blogController.getPostById);

// Admin routes (ต้อง auth)
router.post('/', ADMIN, blogController.createPost);
router.put('/:id', ADMIN, blogController.updatePost);
router.delete('/:id', ADMIN, blogController.deletePost);
router.patch('/:id/toggle-publish', ADMIN, blogController.togglePublish);

module.exports = router;
