// CRUD Permissions

const db = require('../../models');
const { Permission, Role, RolePermission } = db;

// 1. ดึง Permissions ทั้งหมด
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. สร้าง Permission ใหม่
exports.createPermission = async (req, res) => {
  try {
    const { resource, action, description } = req.body;

    const newPermission = await Permission.create({
      resource,
      action,
      description
    });

    res.status(201).json({ success: true, data: newPermission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. ลบ Permission
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    await Permission.destroy({ where: { permission_id: id } });
    res.json({ success: true, message: 'ลบ Permission สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ดึง Permissions ของ Role
exports.getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByPk(roleId, {
      include: [{ 
        model: Permission, 
        as: 'permissionsList',
        through: { attributes: [] } // ไม่เอา junction table fields
      }]
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'ไม่พบ Role' });
    }

    res.json({ 
      success: true, 
      data: {
        role_id: role.role_id,
        role_name: role.role_name,
        description: role.description,
        permissions_json: role.permissions, // จาก JSON column
        permissions_table: role.permissionsList // จาก RolePermissions table
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. กำหนด Permissions ให้ Role (แบบ Table)
exports.assignPermissionsToRole = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { roleId } = req.params;
    const { permission_ids } = req.body; // Array of permission IDs

    // ลบ Permissions เก่าทั้งหมด
    await RolePermission.destroy({ 
      where: { role_id: roleId },
      transaction 
    });

    // เพิ่ม Permissions ใหม่
    const records = permission_ids.map(permId => ({
      role_id: roleId,
      permission_id: permId
    }));

    await RolePermission.bulkCreate(records, { transaction });

    await transaction.commit();
    res.json({ success: true, message: 'กำหนดสิทธิ์สำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. อัพเดต Permissions ของ Role (แบบ JSON)
exports.updateRolePermissionsJson = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions, description } = req.body;

    await Role.update(
      { permissions, description },
      { where: { role_id: roleId } }
    );

    res.json({ success: true, message: 'อัพเดตสิทธิ์สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. เพิ่ม Permissions เริ่มต้น (Seeder)
exports.seedPermissions = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const defaultPermissions = [
      // Products
      { resource: 'products', action: 'create', description: 'เพิ่มสินค้าใหม่' },
      { resource: 'products', action: 'read', description: 'ดูข้อมูลสินค้า' },
      { resource: 'products', action: 'update', description: 'แก้ไขข้อมูลสินค้า' },
      { resource: 'products', action: 'delete', description: 'ลบสินค้า' },

      // Cars
      { resource: 'cars', action: 'create', description: 'เพิ่มรุ่นรถใหม่' },
      { resource: 'cars', action: 'read', description: 'ดูข้อมูลรถ' },
      { resource: 'cars', action: 'update', description: 'แก้ไขข้อมูลรถ' },
      { resource: 'cars', action: 'delete', description: 'ลบรุ่นรถ' },

      // Services
      { resource: 'services', action: 'create', description: 'เพิ่มบริการใหม่' },
      { resource: 'services', action: 'read', description: 'ดูข้อมูลบริการ' },
      { resource: 'services', action: 'update', description: 'แก้ไขบริการ' },
      { resource: 'services', action: 'delete', description: 'ลบบริการ' },

      // Orders
      { resource: 'orders', action: 'create', description: 'สร้างออเดอร์' },
      { resource: 'orders', action: 'read', description: 'ดูออเดอร์' },
      { resource: 'orders', action: 'update', description: 'แก้ไขสถานะออเดอร์' },
      { resource: 'orders', action: 'delete', description: 'ยกเลิกออเดอร์' },

      // Customers
      { resource: 'customers', action: 'create', description: 'เพิ่มลูกค้า' },
      { resource: 'customers', action: 'read', description: 'ดูข้อมูลลูกค้า' },
      { resource: 'customers', action: 'update', description: 'แก้ไขข้อมูลลูกค้า' },
      { resource: 'customers', action: 'delete', description: 'ลบข้อมูลลูกค้า' },

      // Users (Admin Management)
      { resource: 'users', action: 'create', description: 'เพิ่มผู้ใช้ใหม่' },
      { resource: 'users', action: 'read', description: 'ดูรายการผู้ใช้' },
      { resource: 'users', action: 'update', description: 'แก้ไขข้อมูลผู้ใช้' },
      { resource: 'users', action: 'delete', description: 'ลบผู้ใช้' },

      // Promotions
      { resource: 'promotions', action: 'create', description: 'เพิ่มโปรโมชั่นใหม่' },
      { resource: 'promotions', action: 'read', description: 'ดูโปรโมชั่น' },
      { resource: 'promotions', action: 'update', description: 'แก้ไขโปรโมชั่น' },
      { resource: 'promotions', action: 'delete', description: 'ลบโปรโมชั่น' },

      // Blog
      { resource: 'blog', action: 'create', description: 'เพิ่มบทความใหม่' },
      { resource: 'blog', action: 'read', description: 'ดูบทความ' },
      { resource: 'blog', action: 'update', description: 'แก้ไขบทความ' },
      { resource: 'blog', action: 'delete', description: 'ลบบทความ' },

      // Portfolio
      { resource: 'portfolio', action: 'create', description: 'เพิ่มผลงานใหม่' },
      { resource: 'portfolio', action: 'read', description: 'ดูผลงาน' },
      { resource: 'portfolio', action: 'update', description: 'แก้ไขผลงาน' },
      { resource: 'portfolio', action: 'delete', description: 'ลบผลงาน' },

      // Contact
      { resource: 'contact', action: 'create', description: 'เพิ่มข้อความติดต่อ' },
      { resource: 'contact', action: 'read', description: 'ดูข้อความติดต่อ' },
      { resource: 'contact', action: 'update', description: 'อัปเดตสถานะข้อความ' },
      { resource: 'contact', action: 'delete', description: 'ลบข้อความติดต่อ' },

      // Sticker
      { resource: 'sticker', action: 'create', description: 'เพิ่มสติกเกอร์ใหม่' },
      { resource: 'sticker', action: 'read', description: 'ดูสติกเกอร์' },
      { resource: 'sticker', action: 'update', description: 'แก้ไขสติกเกอร์' },
      { resource: 'sticker', action: 'delete', description: 'ลบสติกเกอร์' },

      // FAQ
      { resource: 'faq', action: 'create', description: 'เพิ่มคำถามที่พบบ่อย' },
      { resource: 'faq', action: 'read', description: 'ดูคำถามที่พบบ่อย' },
      { resource: 'faq', action: 'update', description: 'แก้ไขคำถามที่พบบ่อย' },
      { resource: 'faq', action: 'delete', description: 'ลบคำถามที่พบบ่อย' },

      // Reports
      { resource: 'reports', action: 'read', description: 'ดูรายงาน' },
      { resource: 'reports', action: 'export', description: 'ส่งออกรายงาน' },

      // Settings
      { resource: 'settings', action: 'read', description: 'ดูการตั้งค่า' },
      { resource: 'settings', action: 'update', description: 'แก้ไขการตั้งค่าระบบ' }
    ];

    for (const perm of defaultPermissions) {
      await Permission.findOrCreate({
        where: { resource: perm.resource, action: perm.action },
        defaults: perm,
        transaction
      });
    }

    await transaction.commit();
    res.json({ 
      success: true, 
      message: `เพิ่ม Permissions เริ่มต้นสำเร็จ (${defaultPermissions.length} รายการ)` 
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};
