// productTypes.controller.js
// Controller สำหรับจัดการประเภทสินค้า (ProductTypes) ใน inventory module

const db = require('../../models');

exports.getAllTypes = async (req, res) => {
  try {
    const types = await db.sequelize.query('SELECT * FROM ProductTypes', { type: db.sequelize.QueryTypes.SELECT });
    res.json({ items: types });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า', error: err.message });
  }
};

exports.createType = async (req, res) => {
  try {
    const { type_name, description } = req.body;
    if (!type_name) return res.status(400).json({ message: 'กรุณาระบุชื่อประเภทสินค้า' });
    await db.sequelize.query(
      'INSERT INTO ProductTypes (type_name, description) VALUES (?, ?)',
      { replacements: [type_name, description || null] }
    );
    res.status(201).json({ message: 'สร้างประเภทสินค้าเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างประเภทสินค้า', error: err.message });
  }
};

exports.updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name, description } = req.body;
    // ตรวจสอบว่ามีประเภทนี้จริงไหม
    const [type] = await db.sequelize.query(
      'SELECT * FROM ProductTypes WHERE product_type_id = ?',
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );
    if (!type) return res.status(404).json({ message: 'ไม่พบประเภทสินค้า' });
    await db.sequelize.query(
      'UPDATE ProductTypes SET type_name = ?, description = ? WHERE product_type_id = ?',
      { replacements: [type_name, description, id] }
    );
    res.json({ message: 'อัปเดตประเภทสินค้าเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตประเภทสินค้า', error: err.message });
  }
};

exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    await db.sequelize.query(
      'DELETE FROM ProductTypes WHERE product_type_id = ?',
      { replacements: [id] }
    );
    res.json({ message: 'ลบประเภทสินค้าเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบประเภทสินค้า', error: err.message });
  }
};
