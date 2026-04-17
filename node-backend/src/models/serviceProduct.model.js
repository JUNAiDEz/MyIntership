module.exports = (sequelize, DataTypes) => {
  const ServiceProduct = sequelize.define(
    'ServiceProduct',
    {
      service_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      product_variant_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      quantity_used: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
    },
    {
      tableName: 'ServiceProducts',
      timestamps: false
    }
  );

  return ServiceProduct;
};
