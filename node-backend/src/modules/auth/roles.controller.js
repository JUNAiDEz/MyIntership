// CRUD Role

const db = require('../../models');
const { Role } = db;

// ดึง Role ทั้งหมด (เอาไว้โชว์ใน Dropdown ตอนสร้าง User)
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// สร้าง Role ใหม่ (ถ้าจำเป็น)
exports.createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const newRole = await Role.create({ role_name });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};