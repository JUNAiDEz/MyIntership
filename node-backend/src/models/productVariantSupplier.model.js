module.exports = (sequelize, DataTypes) => {
  const ProductVariantSupplier = sequelize.define(
    'ProductVariantSupplier',
    {
      product_variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    },
    {
      tableName: 'ProductVariantSuppliers',
      timestamps: false
    }
  );

  return ProductVariantSupplier;
};
