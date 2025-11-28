// CRUD User, Reset Password

const db = require('../../models');
const { User, Role, Customer, Employee } = db;

// ดึง User ทั้งหมดในระบบ (ทั้งลูกค้าและพนักงาน)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }, // ห้ามส่ง Hash ออกไป
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }, // ถ้าเป็นพนักงาน
        { model: Customer, as: 'customer' }  // ถ้าเป็นลูกค้า
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Active (แบน/ปลดแบน)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });

    user.is_active = !user.is_active; // สลับสถานะ
    await user.save();

    res.json({ message: `เปลี่ยนสถานะเป็น ${user.is_active ? 'Active' : 'Inactive'} สำเร็จ` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};