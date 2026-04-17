// CRUD Employee, Set Position

const bcrypt = require('bcryptjs');
const db = require('../../models');
const { User, Employee, Role, AuditLog } = db;

// 1. สร้างพนักงานใหม่ (Create User + Employee)
exports.createEmployee = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      username, email, password, 
      first_name, last_name, phone_number, 
      position, role_id 
    } = req.body;

    // เช็ค Username/Email ซ้ำ
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ message: 'Username นี้มีผู้ใช้แล้ว' });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // A. สร้าง User
    const newUser = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role_id: role_id, // เช่น Role ID ของ 'Technician' หรือ 'Manager'
      is_active: true
    }, { transaction });

    // B. สร้าง Employee Profile
    const newEmployee = await Employee.create({
      user_id: newUser.user_id,
      role_id: role_id, // เพิ่ม role_id ลง Employee table ด้วย
      first_name,
      last_name,
      phone_number,
      position, // เช่น 'Head Mechanic', 'Cashier'
      is_active: true
    }, { transaction });

    // C. เก็บ Log
    await AuditLog.create({
      user_id: req.user.id, // คนที่กดเพิ่ม (Admin)
      action: 'INSERT',
      table_name: 'Employees',
      record_id: newEmployee.employee_id,
      new_values: { username, position }
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: 'เพิ่มพนักงานสำเร็จ', data: newEmployee });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายชื่อพนักงานทั้งหมด
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { 
          model: User,
          attributes: ['user_id', 'username', 'email', 'is_active'],
          include: [{ 
            model: Role, 
            as: 'role',
            attributes: ['role_id', 'role_name', 'description']
          }] 
        },
        {
          model: Role,
          as: 'role',
          attributes: ['role_id', 'role_name', 'description']
        }
      ],
      order: [['employee_id', 'DESC']]
    });
    res.json(employees);
  } catch (error) {
    console.error('getAllEmployees error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 3. แก้ไขข้อมูลพนักงาน
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // employee_id
    const { first_name, last_name, phone_number, position, is_active } = req.body;

    await Employee.update(
      { first_name, last_name, phone_number, position, is_active },
      { where: { employee_id: id } }
    );

    res.json({ message: 'อัปเดตข้อมูลพนักงานสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};