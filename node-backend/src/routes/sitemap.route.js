const express = require('express');
const router = express.Router();
const db = require('../models');
const { ProductTemplate } = db;

// Dynamic sitemap.xml for products
router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await ProductTemplate.findAll({ attributes: ['slug', 'updated_at'] });
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    products.forEach(p => {
      xml += `  <url>\n    <loc>https://front.gt7dev.com/shop/${p.slug}</loc>\n    <lastmod>${(p.updated_at || new Date()).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml').send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
