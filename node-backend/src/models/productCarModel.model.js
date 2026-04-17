module.exports = (sequelize, DataTypes) => {
  const ProductCarModel = sequelize.define(
    'ProductCarModel',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductTemplates',
          key: 'product_template_id'
        },
        onDelete: 'CASCADE'
      },
      car_model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'CarModels',
          key: 'car_model_id'
        },
        onDelete: 'CASCADE'
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
      note: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'ProductCarModel',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['product_template_id', 'car_model_id']
        }
      ]
    }
  );

  return ProductCarModel;
};
