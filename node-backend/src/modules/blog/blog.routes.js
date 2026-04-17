const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
// const { protect, adminOnly } = require('../../middleware/auth'); // Uncomment when auth is ready

// Public routes (published posts only)
router.get('/', blogController.getAllPosts);
router.get('/:idOrSlug', blogController.getPostById);

// Admin routes (require authentication)
// Uncomment these when authentication middleware is ready:
// router.post('/', protect, adminOnly, blogController.createPost);
// router.put('/:id', protect, adminOnly, blogController.updatePost);
// router.delete('/:id', protect, adminOnly, blogController.deletePost);
// router.patch('/:id/toggle-publish', protect, adminOnly, blogController.togglePublish);

// Temporary routes without auth (for development):
router.post('/', blogController.createPost);
router.put('/:id', blogController.updatePost);
router.delete('/:id', blogController.deletePost);
router.patch('/:id/toggle-publish', blogController.togglePublish);

module.exports = router;
