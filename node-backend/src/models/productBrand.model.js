module.exports = (sequelize, DataTypes) => {
  const ProductBrand = sequelize.define(
    'ProductBrand',
    {
      brand_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      brand_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: 'ProductBrands',
      timestamps: false
    }
  );

  return ProductBrand;
};
