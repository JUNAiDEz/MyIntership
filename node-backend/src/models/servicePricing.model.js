module.exports = (sequelize, DataTypes) => {
  const ServicePricing = sequelize.define(
    'ServicePricing',
    {
      service_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      car_model_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    },
    {
      tableName: 'ServicePricing',
      timestamps: false
    }
  );

  return ServicePricing;
};
