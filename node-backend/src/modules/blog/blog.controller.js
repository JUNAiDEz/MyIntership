const db = require('../../models');
const { Op } = require('sequelize');
const BlogPost = db.BlogPost;

// @desc    Get all blog posts (with optional filters)
// @route   GET /api/blog
// @access  Public (published only) / Admin (all)
exports.getAllPosts = async (req, res) => {
  try {
    const { search, published, page = 1, limit = 10 } = req.query;
    const isAdmin = req.user?.role === 'admin'; // Assuming auth middleware sets req.user

    const whereClause = {};

    // Filter by published status
    if (published !== undefined) {
      whereClause.is_published = published === 'true' || published === '1';
    } else if (!isAdmin) {
      // Non-admin users can only see published posts
      whereClause.is_published = true;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await BlogPost.findAndCountAll({
      where: whereClause,
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

// @desc    Get single blog post by ID or slug
// @route   GET /api/blog/:idOrSlug
// @access  Public (if published) / Admin (any)
exports.getPostById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const whereClause = {
      [Op.or]: [
        { id: isNaN(idOrSlug) ? null : parseInt(idOrSlug) },
        { slug: idOrSlug }
      ]
    };

    if (!isAdmin) {
      whereClause.is_published = true;
    }

    const post = await BlogPost.findOne({ where: whereClause });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

// @desc    Create new blog post
// @route   POST /api/blog
// @access  Admin only
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      content,
      image_url,
      author,
      is_published
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const postData = {
      title,
      slug,
      description,
      content,
      image_url,
      author: author || 'GT7 MOTOR',
      is_published: is_published || false
    };

    // Set published_at if publishing
    if (is_published) {
      postData.published_at = new Date();
    }

    const post = await BlogPost.create(postData);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
};

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Admin only
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      content,
      image_url,
      author,
      is_published
    } = req.body;

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Update fields
    if (title !== undefined) post.title = title;
    if (slug !== undefined) post.slug = slug;
    if (description !== undefined) post.description = description;
    if (content !== undefined) post.content = content;
    if (image_url !== undefined) post.image_url = image_url;
    if (author !== undefined) post.author = author;
    
    // Handle publish status change
    if (is_published !== undefined) {
      const wasPublished = post.is_published;
      post.is_published = is_published;
      
      // Set published_at when publishing for the first time
      if (!wasPublished && is_published && !post.published_at) {
        post.published_at = new Date();
      }
    }

    await post.save();

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Error updating blog post:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Admin only
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/blog/:id/toggle-publish
// @access  Admin only
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    post.is_published = !post.is_published;
    
    // Set published_at when publishing
    if (post.is_published && !post.published_at) {
      post.published_at = new Date();
    }

    await post.save();

    res.json({
      success: true,
      message: `Blog post ${post.is_published ? 'published' : 'unpublished'} successfully`,
      data: post
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle publish status',
      error: error.message
    });
  }
};
