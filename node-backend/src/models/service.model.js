module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
    {
      service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      service_name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(150), allowNull: true, unique: true, comment: 'SEO-friendly URL slug for Service' },
      description: { type: DataTypes.TEXT, allowNull: true },
      category_id: { type: DataTypes.INTEGER, allowNull: true },
      base_labor_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
      is_popular: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName: 'Services',
      timestamps: false // ✅ คงค่าเดิมไว้ เพื่อไม่ให้ Error ว่าหาคอลัมน์ createdAt ไม่เจอ
    }
  );

  // ✅ ส่วนที่เพิ่มมาใหม่ (จำเป็นต้องมีเพื่อให้ Controller ไม่พัง)
  Service.associate = (models) => {
    // 1. เชื่อมหมวดหมู่
    if (models.ServiceCategory) {
      Service.belongsTo(models.ServiceCategory, {
        foreignKey: 'category_id',
        as: 'category' 
      });
    }

    // 2. เชื่อมรูปภาพ
    if (models.ServiceImage) {
      Service.hasMany(models.ServiceImage, {
        foreignKey: 'service_id',
        as: 'images'
      });
    }

    // 3. เชื่อม BOM (อะไหล่)
    if (models.ServiceProduct) {
      Service.hasMany(models.ServiceProduct, {
        foreignKey: 'service_id',
        as: 'required_products'
      });
    }

    // 4. เชื่อมราคา
    if (models.ServicePricing) {
        Service.hasMany(models.ServicePricing, {
          foreignKey: 'service_id',
          as: 'pricings'
        });
    }
  };

  return Service;
};