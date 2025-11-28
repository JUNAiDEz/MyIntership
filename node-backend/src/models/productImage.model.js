module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'ProductImage',
    {
      image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      product_template_id: { type: DataTypes.INTEGER, allowNull: false },
      image_url: { type: DataTypes.STRING(255), allowNull: false },
      alt_text: { type: DataTypes.STRING(255), allowNull: true },
      is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      tableName: 'ProductImages',
      timestamps: false
    }
  );

  return ProductImage;
};
