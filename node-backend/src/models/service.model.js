module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
    {
      service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      service_name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      category_id: { type: DataTypes.INTEGER, allowNull: true },
      base_labor_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
      is_popular: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName: 'Services',
      timestamps: false
    }
  );

  return Service;
};
