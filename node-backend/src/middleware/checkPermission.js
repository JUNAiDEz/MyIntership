// Middleware สำหรับตรวจสอบ Permission แบบละเอียด

const db = require('../models');

/**
 * ตรวจสอบว่า User มีสิทธิ์ทำ action กับ resource หรือไม่
 * @param {string} resource - ชื่อ resource เช่น 'products', 'cars', 'services'
 * @param {string} action - การกระทำ เช่น 'create', 'read', 'update', 'delete'
 * @returns {Function} Express middleware
 * 
 * วิธีใช้:
 * router.post('/products', verifyToken, checkPermission('products', 'create'), controller.createProduct);
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 1. ดึงข้อมูล User พร้อม Role
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Role, as: 'role' }]
      });

      if (!user || !user.role) {
        return res.status(403).json({ 
          message: 'ไม่พบข้อมูลผู้ใช้หรือบทบาท' 
        });
      }

      const role = user.role;

      // 2. ตรวจสอบจาก JSON permissions column (แบบง่าย)
      if (role.permissions) {
        const permissions = role.permissions;
        
        // ตรวจสอบว่ามีสิทธิ์หรือไม่
        if (permissions[resource] && permissions[resource].includes(action)) {
          return next(); // ✅ มีสิทธิ์
        }
      }

      // 3. ตรวจสอบจาก RolePermissions table (แบบละเอียด)
      const hasPermission = await db.sequelize.query(`
        SELECT 1 
        FROM RolePermissions rp
        JOIN Permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :roleId 
          AND p.resource = :resource 
          AND p.action = :action
        LIMIT 1
      `, {
        replacements: { 
          roleId: role.role_id, 
          resource, 
          action 
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      if (hasPermission && hasPermission.length > 0) {
        return next(); // ✅ มีสิทธิ์
      }

      // ❌ ไม่มีสิทธิ์
      return res.status(403).json({ 
        message: `คุณไม่มีสิทธิ์ ${action} ข้อมูล ${resource}`,
        required: { resource, action }
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
        error: error.message 
      });
    }
  };
};

/**
 * ตรวจสอบว่า User มีสิทธิ์อย่างใดอย่างหนึ่งใน list
 * @param {Array} permissionList - รายการ permissions เช่น [{resource: 'products', action: 'create'}, ...]
 */
const checkAnyPermission = (permissionList) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Role, as: 'role' }]
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
      }

      const role = user.role;

      // ตรวจสอบจาก JSON permissions
      if (role.permissions) {
        for (const perm of permissionList) {
          if (role.permissions[perm.resource]?.includes(perm.action)) {
            return next(); // มีสิทธิ์อย่างใดอย่างหนึ่ง
          }
        }
      }

      // ตรวจสอบจาก RolePermissions table
      const conditions = permissionList.map((p, idx) => 
        `(p.resource = :resource${idx} AND p.action = :action${idx})`
      ).join(' OR ');

      const replacements = { roleId: role.role_id };
      permissionList.forEach((p, idx) => {
        replacements[`resource${idx}`] = p.resource;
        replacements[`action${idx}`] = p.action;
      });

      const hasPermission = await db.sequelize.query(`
        SELECT 1 
        FROM RolePermissions rp
        JOIN Permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :roleId 
          AND (${conditions})
        LIMIT 1
      `, {
        replacements,
        type: db.sequelize.QueryTypes.SELECT
      });

      if (hasPermission && hasPermission.length > 0) {
        return next();
      }

      return res.status(403).json({ 
        message: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้'
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission
};
