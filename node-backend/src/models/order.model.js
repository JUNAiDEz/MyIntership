module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.ENUM('Pending', 'In_Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
      },
      sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total_discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      grand_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      }
    },
    {
      tableName: 'Orders',
      timestamps: false
    }
  );

  return Order;
};
