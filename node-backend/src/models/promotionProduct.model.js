module.exports = (sequelize, DataTypes) => {
  const PromotionProduct = sequelize.define(
    'PromotionProduct',
    {
      promotion_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      product_variant_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      discounted_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
    },
    {
      tableName: 'PromotionProducts',
      timestamps: false
    }
  );

  return PromotionProduct;
};
