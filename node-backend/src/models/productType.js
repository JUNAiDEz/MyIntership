// productType.js
// Sequelize model สำหรับ ProductTypes

module.exports = (sequelize, DataTypes) => {
  const ProductType = sequelize.define('ProductType', {
    product_type_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ProductTypes',
    timestamps: false
  });
  return ProductType;
};
