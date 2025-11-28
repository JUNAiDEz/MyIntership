// Login, Register, GetMe, RefreshTokenconst bcrypt = require('bcryptjs');

const bcrypt = require('bcryptjs'); // ✅ ต้องมีบรรทัดนี้!
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { User, Role, Customer, Employee, AuditLog } = db;
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

// สมัครสมาชิก (Register)
exports.register = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { username, email, password, first_name, last_name, phone_number } = req.body;

    // 1. ตรวจสอบว่า User/Email ซ้ำไหม
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username หรือ Email นี้ถูกใช้งานแล้ว' });
    }

    // 2. หา Role Customer
    const customerRole = await Role.findOne({ where: { role_name: 'Customer' } });
    if (!customerRole) {
      throw new Error("ไม่พบ Role 'Customer' ในระบบ (กรุณา Seed Data)");
    }

    // 3. Hash Password (ต้องใช้ bcrypt ตรงนี้)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. สร้าง User
    const newUser = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role_id: customerRole.role_id,
      is_active: true
    }, { transaction });

    // 5. สร้าง Customer Profile
    await Customer.create({
      user_id: newUser.user_id,
      first_name,
      last_name,
      phone_number,
      email
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ 
      message: 'สมัครสมาชิกสำเร็จ', 
      userId: newUser.user_id 
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก', error: error.message });
  }
};

// เข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 1. ค้นหา User
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }]
      },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // 2. ตรวจสอบ Password (ต้องใช้ bcrypt ตรงนี้)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'บัญชีนี้ถูกระงับการใช้งาน' });
    }

    // 3. สร้าง Token
    const payload = {
      id: user.user_id,
      username: user.username,
      role: user.role.role_name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role.role_name
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Customer, as: 'customer' },
        { model: Employee, as: 'employee' }
      ]
    });

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};