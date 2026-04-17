module.exports = (sequelize, DataTypes) => {
  const PromotionService = sequelize.define(
    'PromotionService',
    {
      promotion_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      service_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      discounted_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
    },
    {
      tableName: 'PromotionServices',
      timestamps: false
    }
  );

  return PromotionService;
};
