// User Permission Management Controller

const db = require('../../models');
const { User, Permission, UserPermission } = db;

// 1. ดึงสิทธิ์ของผู้ใช้
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ 
        model: Permission, 
        as: 'userPermissions',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }

    res.json({ 
      success: true, 
      data: user.userPermissions || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. กำหนดสิทธิ์ให้ผู้ใช้ (แทนที่ทั้งหมด)
exports.assignPermissionsToUser = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { userId } = req.params;
    const { permission_ids } = req.body; // Array of permission IDs

    // ตรวจสอบว่ามีผู้ใช้อยู่จริง
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }

    // ลบสิทธิ์เก่าทั้งหมด
    await UserPermission.destroy({ 
      where: { user_id: userId },
      transaction 
    });

    // เพิ่มสิทธิ์ใหม่
    if (permission_ids && permission_ids.length > 0) {
      const records = permission_ids.map(permId => ({
        user_id: userId,
        permission_id: permId
      }));

      await UserPermission.bulkCreate(records, { transaction });
    }

    await transaction.commit();
    res.json({ success: true, message: 'กำหนดสิทธิ์สำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. เพิ่มสิทธิ์ให้ผู้ใช้ (เพิ่มเติม ไม่ลบของเก่า)
exports.addPermissionToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permission_id } = req.body;

    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const existing = await UserPermission.findOne({
      where: { user_id: userId, permission_id }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'สิทธิ์นี้มีอยู่แล้ว' });
    }

    await UserPermission.create({
      user_id: userId,
      permission_id
    });

    res.json({ success: true, message: 'เพิ่มสิทธิ์สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ลบสิทธิ์ของผู้ใช้
exports.removePermissionFromUser = async (req, res) => {
  try {
    const { userId, permissionId } = req.params;

    const deleted = await UserPermission.destroy({
      where: { user_id: userId, permission_id: permissionId }
    });

    if (deleted === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบสิทธิ์นี้' });
    }

    res.json({ success: true, message: 'ลบสิทธิ์สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. ลบสิทธิ์ทั้งหมดของผู้ใช้
exports.clearUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    await UserPermission.destroy({
      where: { user_id: userId }
    });

    res.json({ success: true, message: 'ลบสิทธิ์ทั้งหมดสำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
