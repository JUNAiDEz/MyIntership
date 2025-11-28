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
    try { console.log('verifyToken: decoded token ->', JSON.stringify(decoded)); } catch(e) { console.log('verifyToken: decoded token', decoded); }
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