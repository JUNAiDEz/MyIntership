module.exports = (sequelize, DataTypes) => {
  const ServiceCategory = sequelize.define(
    'ServiceCategory',
    {
      category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      category_name: { type: DataTypes.STRING(100), allowNull: false },
      parent_category_id: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
      tableName: 'ServiceCategories',
      timestamps: false
    }
  );

  return ServiceCategory;
};
