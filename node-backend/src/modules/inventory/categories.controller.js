exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, parent_category_id } = req.body;
    const category = await ProductCategory.findByPk(id);
    if (!category) return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    category.category_name = category_name ?? category.category_name;
    category.parent_category_id = parent_category_id ?? category.parent_category_id;
    await category.save();
    res.json({ message: 'อัปเดตหมวดหมู่เรียบร้อย', data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findByPk(id);
    if (!category) return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    await category.destroy();
    res.json({ message: 'ลบหมวดหมู่เรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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
    res.json({ items: categories });
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