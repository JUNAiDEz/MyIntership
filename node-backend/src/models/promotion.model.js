module.exports = (sequelize, DataTypes) => {
  const Promotion = sequelize.define(
    'Promotion',
    {
      promotion_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      promotion_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      promotion_type: {
        type: DataTypes.ENUM('PERCENT', 'FIXED_AMOUNT', 'BUNDLE'),
        allowNull: false
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_popular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'Promotions',
      timestamps: false
    }
  );

  return Promotion;
};
