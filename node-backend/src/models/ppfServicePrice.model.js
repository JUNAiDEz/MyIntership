module.exports = (sequelize, DataTypes) => {
  const PPFServicePrice = sequelize.define('PPFServicePrice', {
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
    ppf_series_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PPFSeries',
        key: 'ppf_series_id'
      }
    },
    full_car_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    full_front_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    standard_front_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    bumper_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    estimated_days: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    }
  }, {
    tableName: 'PPFServicePrices',
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['car_model_id', 'ppf_series_id']
    }]
  });

  PPFServicePrice.associate = (models) => {
    PPFServicePrice.belongsTo(models.CarModel, {
      foreignKey: 'car_model_id',
      as: 'car_model'
    });
    PPFServicePrice.belongsTo(models.PPFSeries, {
      foreignKey: 'ppf_series_id',
      as: 'ppf_series'
    });
  };

  return PPFServicePrice;
};
