const db = require('../../models');

// เพิ่มหรืออัปเดตความสัมพันธ์สินค้า-รุ่นรถ
exports.addOrUpdateProductCarModel = async (req, res) => {
  try {
    const { product_template_id, car_model_id, price, note } = req.body;
    const [pcm, created] = await db.ProductCarModel.findOrCreate({
      where: { product_template_id, car_model_id },
      defaults: { price, note }
    });
    if (!created) {
      await pcm.update({ price, note });
    }
    res.json({ success: true, data: pcm });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ลบความสัมพันธ์สินค้า-รุ่นรถ
exports.deleteProductCarModel = async (req, res) => {
  try {
    const { product_template_id, car_model_id } = req.body;
    await db.ProductCarModel.destroy({ where: { product_template_id, car_model_id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ดึงรุ่นรถที่ผูกกับสินค้า
exports.getCarModelsByProduct = async (req, res) => {
  try {
    const { product_template_id } = req.params;
    const list = await db.ProductCarModel.findAll({
      where: { product_template_id },
      include: [{ model: db.CarModel, as: 'car_model' }]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ดึงสินค้าที่ผูกกับรุ่นรถ
exports.getProductsByCarModel = async (req, res) => {
  try {
    const { car_model_id } = req.params;
    const list = await db.ProductCarModel.findAll({
      where: { car_model_id },
      include: [{
        model: db.ProductTemplate,
        as: 'product_template',
        include: [{ model: db.ProductImage, as: 'images', required: false }]
      }]
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
