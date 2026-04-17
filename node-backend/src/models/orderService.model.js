module.exports = (sequelize, DataTypes) => {
  const OrderService = sequelize.define(
    'OrderService',
    {
      order_service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
      technician_id: { type: DataTypes.INTEGER, allowNull: true },
      agreed_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    },
    {
      tableName: 'OrderServices',
      timestamps: false
    }
  );

  return OrderService;
};
