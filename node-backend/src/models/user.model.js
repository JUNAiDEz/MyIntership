module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // --- 1. เพิ่ม username เข้ามาใหม่ (NULL ได้) ---
      username: {
        type: DataTypes.STRING(50),
        allowNull: true, // ยอมให้เป็นค่าว่างได้ (สำหรับ Customer)
        unique: true     // ห้ามซ้ำ
      },
      // --- 2. แก้ไข email ให้เป็น NULL ได้ ---
      email: {
        type: DataTypes.STRING(100),
        allowNull: true, // **แก้ตรงนี้** จาก false เป็น true (สำหรับ Admin)
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'Users',
      timestamps: false,
      // --- 3. เพิ่ม Index เพื่อประสิทธิภาพในการค้นหา (Login) ---
      indexes: [
        {
          name: 'idx_user_username', // ชื่อ Index ตาม SQL
          fields: ['username']
        },
        {
          name: 'idx_user_email', // ชื่อ Index ตาม SQL
          fields: ['email']
        },
        // (Optional) Index สำหรับ role_id เพื่อการ Join ที่รวดเร็ว
        {
          name: 'idx_role_id',
          fields: ['role_id']
        }
      ]
    }
  );

  return User;
};