const db = require('../../models');
const { PortfolioCategory } = db;

// 1. ดึงหมวดหมู่ผลงานทั้งหมด (เอาไว้โชว์ปุ่ม Filter หน้าเว็บ)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await PortfolioCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']] // เรียงตามลำดับที่ตั้งไว้
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. สร้างหมวดหมู่ใหม่ (สำหรับ Admin)
exports.createCategory = async (req, res) => {
  try {
    const { category_name, slug, sort_order } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!category_name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อหมวดหมู่' });
    }

    // สร้าง Slug อัตโนมัติถ้าไม่ได้ส่งมา (เช่น "Brake Upgrade" -> "brake-upgrade")
    const finalSlug = slug || category_name.toLowerCase().trim().replace(/ /g, '-');

    const newCategory = await PortfolioCategory.create({
      category_name,
      slug: finalSlug,
      sort_order: sort_order || 0,
      is_active: true
    });

    res.status(201).json({
      message: 'สร้างหมวดหมู่ผลงานสำเร็จ',
      data: newCategory
    });

  } catch (error) {
    // เช็คกรณีชื่อซ้ำ (ถ้าใน DB ตั้ง Unique ไว้)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'ชื่อหมวดหมู่หรือ Slug นี้มีอยู่แล้ว' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 3. ลบหมวดหมู่ (Soft Delete - ปรับ is_active เป็น false)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await PortfolioCategory.update(
            { is_active: false },
            { where: { portfolio_category_id: id } }
        );
        res.json({ message: 'ลบหมวดหมู่สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};