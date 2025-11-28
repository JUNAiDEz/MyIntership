module.exports = (sequelize, DataTypes) => {
  const ProductTemplate = sequelize.define(
    'ProductTemplate',
    {
      product_template_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      is_popular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'ProductTemplates',
      timestamps: false
    }
  );

  return ProductTemplate;
};
