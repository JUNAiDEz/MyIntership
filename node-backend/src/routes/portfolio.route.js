const express = require('express');
const router = express.Router();

const db = require('../models');


// GET /api/portfolio - list all from DB
router.get('/', async (req, res) => {
  try {
    const projects = await db.PortfolioProject.findAll({
      where: { is_active: true },
      include: [
        { model: db.PortfolioGallery, as: 'gallery', attributes: ['image_url'] },
        { model: db.CarModel, as: 'car_model', attributes: ['model_name'] },
        {
          model: db.PortfolioCategory,
          as: 'categories',
          attributes: ['category_name', 'slug'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']]
    });
    // Map to frontend structure
    const result = projects.map(p => ({
      id: p.project_id,
      slug: p.slug,
      title: p.title,
      year: p.completion_date ? new Date(p.completion_date).getFullYear() : null,
      model: p.car_model ? p.car_model.model_name : '',
      image: p.cover_image_url,
      summary: p.description,
      services: p.categories ? p.categories.map(c => ({ id: c.portfolio_category_id, title: c.category_name })) : [],
      gallery: p.gallery ? p.gallery.map(g => g.image_url) : []
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/portfolio/:slug - get by slug from DB
router.get('/:slug', async (req, res) => {
  try {
    const p = await db.PortfolioProject.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [
        { model: db.PortfolioGallery, as: 'gallery', attributes: ['image_url'] },
        { model: db.CarModel, as: 'car_model', attributes: ['model_name'] },
        {
          model: db.PortfolioCategory,
          as: 'categories',
          attributes: ['category_name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });
    if (!p) return res.status(404).json({ error: 'Not found' });
    const result = {
      id: p.project_id,
      slug: p.slug,
      title: p.title,
      year: p.completion_date ? new Date(p.completion_date).getFullYear() : null,
      model: p.car_model ? p.car_model.model_name : '',
      image: p.cover_image_url,
      summary: p.description,
      services: p.categories ? p.categories.map(c => ({ id: c.portfolio_category_id, title: c.category_name })) : [],
      gallery: p.gallery ? p.gallery.map(g => g.image_url) : []
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
