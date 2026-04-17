// models/dealer.js (หรือ dealer.model.js)

module.exports = (sequelize, DataTypes) => {
  const Dealer = sequelize.define('Dealer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Dealer name is required' }
      }
    },
    image_url: {
      // ใช้ TEXT('long') เพื่อให้รองรับรูปภาพแบบ Base64 ได้เหมือนหน้าบทความ
      type: DataTypes.TEXT('long'), 
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // เปิดใช้งานเป็นค่าเริ่มต้น
      field: 'is_active',
      comment: 'ใช้สำหรับเปิด/ปิดการแสดงผลโลโก้นี้ที่หน้าเว็บ'
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order',
      comment: 'ใช้สำหรับจัดลำดับการแสดงผล (ค่าน้อยอยู่ก่อน)'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'Dealers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Dealer;
};