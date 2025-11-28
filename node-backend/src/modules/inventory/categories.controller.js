// จัดการ Product Category

const db = require('../../models');
const { ProductCategory } = db;

exports.getAllCategories = async (req, res) => {
  try {
    // ดึงมาแบบมี Parent (เช่น ยางรถยนต์ -> ยางขอบ 17)
    const categories = await ProductCategory.findAll({
      include: [{ 
        model: ProductCategory, 
        as: 'parent',
        attributes: ['category_name']
      }]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name, parent_category_id } = req.body;
    const newCategory = await ProductCategory.create({
      category_name,
      parent_category_id
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};