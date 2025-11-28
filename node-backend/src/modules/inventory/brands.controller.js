// จัดการ Product Brand

const db = require('../../models');
const { ProductBrand } = db;

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await ProductBrand.findAll();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { brand_name, logo_url } = req.body;
    const newBrand = await ProductBrand.create({ brand_name, logo_url });
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};