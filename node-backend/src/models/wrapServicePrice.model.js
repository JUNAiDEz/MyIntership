module.exports = (sequelize, DataTypes) => {
  const WrapServicePrice = sequelize.define('WrapServicePrice', {
    price_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    car_model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CarModels',
        key: 'model_id'
      }
    },
    series_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WrapFilmSeries',
        key: 'series_id'
      }
    },
    full_wrap_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    roof_wrap_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    hood_wrap_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    estimated_days: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    }
  }, {
    tableName: 'WrapServicePrices',
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['car_model_id', 'series_id']
    }]
  });

  WrapServicePrice.associate = (models) => {
    WrapServicePrice.belongsTo(models.CarModel, {
      foreignKey: 'car_model_id',
      as: 'car_model'
    });
    WrapServicePrice.belongsTo(models.WrapFilmSeries, {
      foreignKey: 'series_id',
      as: 'series'
    });
  };

  return WrapServicePrice;
};
