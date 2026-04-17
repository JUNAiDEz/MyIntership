module.exports = (sequelize, DataTypes) => {
  const ServiceCategory = sequelize.define(
    'ServiceCategory',
    {
      category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      category_name: { type: DataTypes.STRING(100), allowNull: false },
      parent_category_id: { type: DataTypes.INTEGER, allowNull: true },
      category_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Code สำหรับเรียกใช้ใน Code เช่น AIR_CON, NANO_CERAMIC'
      }
    },
    {
      tableName: 'ServiceCategories',
      timestamps: false
    }
  );

  return ServiceCategory;
};
