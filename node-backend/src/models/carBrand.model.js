module.exports = (sequelize, DataTypes) => {
  const CarBrand = sequelize.define(
    'CarBrand',
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
      }
    },
    {
      tableName: 'CarBrands',
      timestamps: false
    }
  );

  return CarBrand;
};
