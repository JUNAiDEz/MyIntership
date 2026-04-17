// CRUD Role

const db = require('../../models');
const { Role, Permission } = db;

// ดึง Role ทั้งหมด (เอาไว้โชว์ใน Dropdown ตอนสร้าง User)
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['role_id', 'role_name', 'description', 'permissions']
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึง Role พร้อม Permissions (แบบละเอียด)
exports.getRoleWithPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissionsList',
        through: { attributes: [] }
      }]
    });
    
    if (!role) {
      return res.status(404).json({ message: 'ไม่พบ Role' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// สร้าง Role ใหม่
exports.createRole = async (req, res) => {
  try {
    const { role_name, description, permissions } = req.body;
    const newRole = await Role.create({ 
      role_name, 
      description,
      permissions: permissions || {} 
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// อัพเดต Role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description, permissions } = req.body;
    
    await Role.update(
      { role_name, description, permissions },
      { where: { role_id: id } }
    );
    
    res.json({ message: 'อัพเดต Role สำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ลบ Role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await Role.destroy({ where: { role_id: id } });
    res.json({ message: 'ลบ Role สำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};