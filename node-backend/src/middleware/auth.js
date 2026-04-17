const jwt = require('jsonwebtoken');
// ใช้ค่าจาก .env หรือถ้าไม่มีให้ใช้ default (ควรตรงกับตอน Login)
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

// Middleware 1: ตรวจสอบ Token (ว่าล็อกอินมาจริงไหม)
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'ไม่มี Token, การเข้าถึงถูกปฏิเสธ' });
  }

  try {
    // ตัด 'Bearer ' ออกถ้ามีการส่งมาแบบ Standard
    // เช่น "Bearer eyJhbGci..." -> "eyJhbGci..."
    const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(bearerToken, JWT_SECRET);
    req.user = decoded; // แนบข้อมูล user (id, role) เข้าไปใน request object
    // Debug log: show decoded token on server console (dev only)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token ไม่ถูกต้อง หรือหมดอายุ' });
  }
};

// Middleware 2: ตรวจสอบ Role (ว่าเป็น Admin/Manager ไหม)
// ต้องใช้คู่กับ verifyToken เสมอ เพราะต้องใช้ req.user
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // เช็คว่ามี req.user ไหม และ Role ของเขาอยู่ในรายการที่อนุญาตไหม
    if (!req.user) {
      console.warn('checkRole: no req.user present');
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (ไม่ได้แนบข้อมูลผู้ใช้)' });
    }

    // Normalize allowed roles and user roles to lower-case for case-insensitive comparison
    const allowed = (allowedRoles || []).map(r => String(r).toLowerCase());
    const userRole = req.user.role ? String(req.user.role).toLowerCase() : null;
    const userRolesArray = Array.isArray(req.user.roles) ? req.user.roles.map(r => String(r).toLowerCase()) : [];

    const hasRole = (userRole && allowed.includes(userRole)) || userRolesArray.some(r => allowed.includes(r));
    if (!hasRole) {
      // Debug details: log allowed roles and user roles
      try { console.warn('checkRole: access denied', { allowed, user: req.user }); } catch(e) { console.warn('checkRole: access denied'); }
      return res.status(403).json({ 
        message: `คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Role ของคุณคือ: ${req.user?.role || 'unknown'})` 
      });
    }
    next();
  };
};

// Middleware 3: ตรวจสอบ Permission แบบละเอียด (ตรวจทั้ง User Permission และ Role Permission)
// เช่น checkPermission('products', 'create')
exports.checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(403).json({ message: 'ไม่สามารถระบุตัวตนผู้ใช้ได้' });
      }

      const db = require('../models');
      const { User, Permission, Role } = db;

      // ดึงข้อมูลผู้ใช้พร้อมสิทธิ์
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Permission,
            as: 'userPermissions', // User-specific permissions
            through: { attributes: [] }
          },
          {
            model: Role,
            as: 'role',
            include: [{
              model: Permission,
              as: 'permissionsList', // Role-based permissions
              through: { attributes: [] }
            }]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
      }

      // ตรวจสอบสิทธิ์จาก UserPermissions (มีความสำคัญสูงสุด)
      const userPerms = user.userPermissions || [];
      const hasUserPerm = userPerms.some(p => 
        p.resource === resource && p.action === action
      );

      if (hasUserPerm) {
        return next();
      }

      // ถ้าไม่มี User Permission ให้ตรวจสอบจาก Role Permissions
      const rolePerms = user.role?.permissionsList || [];
      const hasRolePerm = rolePerms.some(p => 
        p.resource === resource && p.action === action
      );

      if (hasRolePerm) {
        return next();
      }

      // ตรวจสอบจาก JSON column ใน Role (fallback)
      if (user.role?.permissions) {
        try {
          const jsonPerms = typeof user.role.permissions === 'string' 
            ? JSON.parse(user.role.permissions) 
            : user.role.permissions;
          
          if (jsonPerms[resource] && jsonPerms[resource].includes(action)) {
            return next();
          }
        } catch (e) {
          console.error('Error parsing JSON permissions:', e);
        }
      }

      // ไม่มีสิทธิ์
      console.warn(`❌ User ${user.username} denied: ${resource}.${action}`);
      return res.status(403).json({ 
        message: `คุณไม่มีสิทธิ์ในการ ${action} ข้อมูล ${resource}`,
        required: { resource, action }
      });

    } catch (error) {
      console.error('checkPermission error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
    }
  };
};

// Middleware 4: ตรวจสอบสิทธิ์แบบ OR (มีสิทธิ์ใดสิทธิ์หนึ่งก็ผ่าน)
// เช่น checkAnyPermission([{resource: 'products', action: 'read'}, {resource: 'products', action: 'update'}])
exports.checkAnyPermission = (permissionList) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(403).json({ message: 'ไม่สามารถระบุตัวตนผู้ใช้ได้' });
      }

      const db = require('../models');
      const { User, Permission, Role } = db;

      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Permission,
            as: 'userPermissions',
            through: { attributes: [] }
          },
          {
            model: Role,
            as: 'role',
            include: [{
              model: Permission,
              as: 'permissionsList',
              through: { attributes: [] }
            }]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
      }

      // ตรวจสอบทีละสิทธิ์
      for (const perm of permissionList) {
        const { resource, action } = perm;

        // Check User Permissions
        const userPerms = user.userPermissions || [];
        if (userPerms.some(p => p.resource === resource && p.action === action)) {
          return next();
        }

        // Check Role Permissions
        const rolePerms = user.role?.permissionsList || [];
        if (rolePerms.some(p => p.resource === resource && p.action === action)) {
          return next();
        }

        // Check JSON Permissions
        if (user.role?.permissions) {
          try {
            const jsonPerms = typeof user.role.permissions === 'string' 
              ? JSON.parse(user.role.permissions) 
              : user.role.permissions;
            
            if (jsonPerms[resource] && jsonPerms[resource].includes(action)) {
              return next();
            }
          } catch (e) {
            console.error('Error parsing JSON permissions:', e);
          }
        }
      }

      // ไม่มีสิทธิ์เลย
      return res.status(403).json({ 
        message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
        required: permissionList
      });

    } catch (error) {
      console.error('checkAnyPermission error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
    }
  };
};