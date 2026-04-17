const db = require('../../models');
const StickerColor = db.StickerColor;

// Get all sticker colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await StickerColor.findAll({
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    res.json(colors);
  } catch (error) {
    console.error('Error fetching sticker colors:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสี' });
  }
};

// Get single sticker color by ID
exports.getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await StickerColor.findByPk(id);
    
    if (!color) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสี' });
    }
    
    res.json(color);
  } catch (error) {
    console.error('Error fetching sticker color:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสี' });
  }
};

// Create new sticker color
exports.createColor = async (req, res) => {
  try {
    const {
      name,
      color_id,
      color_code,
      css_filter,
      display_order
    } = req.body;

    // Validation
    if (!name || !color_id) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อและ ID ของสี' });
    }

    // Check duplicate color_id
    const existingColor = await StickerColor.findOne({ where: { color_id } });
    if (existingColor) {
      return res.status(400).json({ message: 'ID สีนี้ถูกใช้แล้ว' });
    }

    const newColor = await StickerColor.create({
      name,
      color_id,
      color_code,
      css_filter: css_filter || 'none',
      display_order: display_order || 0
    });

    res.status(201).json({
      message: 'สร้างข้อมูลสีสำเร็จ',
      data: newColor
    });
  } catch (error) {
    console.error('Error creating sticker color:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลสี' });
  }
};

// Update sticker color
exports.updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      color_id,
      color_code,
      css_filter,
      display_order
    } = req.body;

    const color = await StickerColor.findByPk(id);
    
    if (!color) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสี' });
    }

    // Check duplicate color_id (if changed)
    if (color_id && color_id !== color.color_id) {
      const existingColor = await StickerColor.findOne({ where: { color_id } });
      if (existingColor) {
        return res.status(400).json({ message: 'ID สีนี้ถูกใช้แล้ว' });
      }
    }

    await color.update({
      name,
      color_id,
      color_code,
      css_filter,
      display_order
    });

    res.json({
      message: 'อัพเดทข้อมูลสีสำเร็จ',
      data: color
    });
  } catch (error) {
    console.error('Error updating sticker color:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลสี' });
  }
};

// Delete sticker color
exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const color = await StickerColor.findByPk(id);
    
    if (!color) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสี' });
    }

    await color.destroy();

    res.json({ message: 'ลบข้อมูลสีสำเร็จ' });
  } catch (error) {
    console.error('Error deleting sticker color:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลสี' });
  }
};

// Update display order for multiple colors
exports.updateDisplayOrder = async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 1, display_order: 0 }, { id: 2, display_order: 1 }]

    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
    }

    // Update each color's display order
    await Promise.all(
      orders.map(async ({ id, display_order }) => {
        const color = await StickerColor.findByPk(id);
        if (color) {
          await color.update({ display_order });
        }
      })
    );

    res.json({ message: 'อัพเดทลำดับการแสดงผลสำเร็จ' });
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทลำดับการแสดงผล' });
  }
};
