module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      product_variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_template_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      variant_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      sku: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'ProductVariants',
      timestamps: false
    }
  );

  return ProductVariant;
};
