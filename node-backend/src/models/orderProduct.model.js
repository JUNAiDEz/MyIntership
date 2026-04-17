module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define(
    'OrderProduct',
    {
      order_product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_variant_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      sold_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      order_service_id: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
      tableName: 'OrderProducts',
      timestamps: false
    }
  );

  return OrderProduct;
};
