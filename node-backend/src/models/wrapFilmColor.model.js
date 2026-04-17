module.exports = (sequelize, DataTypes) => {
  const WrapFilmColor = sequelize.define('WrapFilmColor', {
    color_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    series_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WrapFilmSeries',
        key: 'series_id'
      }
    },
    color_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    color_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    hex_value: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    texture_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ProductVariants',
        key: 'variant_id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'WrapFilmColors',
    timestamps: false
  });

  WrapFilmColor.associate = (models) => {
    WrapFilmColor.belongsTo(models.WrapFilmSeries, {
      foreignKey: 'series_id',
      as: 'series'
    });
    WrapFilmColor.belongsTo(models.ProductVariant, {
      foreignKey: 'product_variant_id',
      as: 'product'
    });
  };

  return WrapFilmColor;
};
