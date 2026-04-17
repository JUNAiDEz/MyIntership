module.exports = (sequelize, DataTypes) => {
  const WrapFilmSeries = sequelize.define('WrapFilmSeries', {
    series_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    brand_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    series_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    finish_type: {
      type: DataTypes.ENUM('Gloss', 'Matte', 'Satin', 'Texture', 'Chrome', 'ColorFlip'),
      allowNull: false
    },
    warranty_years: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'WrapFilmSeries',
    timestamps: false
  });

  WrapFilmSeries.associate = (models) => {
    WrapFilmSeries.hasMany(models.WrapFilmColor, {
      foreignKey: 'series_id',
      as: 'colors'
    });
    WrapFilmSeries.hasMany(models.WrapServicePrice, {
      foreignKey: 'series_id',
      as: 'prices'
    });
  };

  return WrapFilmSeries;
};
