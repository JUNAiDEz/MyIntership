exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, logo_url } = req.body;
    const brand = await ProductBrand.findByPk(id);
    if (!brand) return res.status(404).json({ message: 'ไม่พบแบรนด์' });
    brand.brand_name = brand_name ?? brand.brand_name;
    brand.logo_url = logo_url ?? brand.logo_url;
    await brand.save();
    res.json({ message: 'อัปเดตแบรนด์เรียบร้อย', data: brand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await ProductBrand.findByPk(id);
    if (!brand) return res.status(404).json({ message: 'ไม่พบแบรนด์' });
    await brand.destroy();
    res.json({ message: 'ลบแบรนด์เรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// จัดการ Product Brand

const db = require('../../models');
const { ProductBrand } = db;

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await ProductBrand.findAll();
    res.json({ items: brands });
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