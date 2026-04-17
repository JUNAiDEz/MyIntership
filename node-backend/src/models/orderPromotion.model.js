module.exports = (sequelize, DataTypes) => {
  const OrderPromotion = sequelize.define(
    'OrderPromotion',
    {
      order_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      promotion_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false }
    },
    {
      tableName: 'OrderPromotions',
      timestamps: false
    }
  );

  return OrderPromotion;
};
