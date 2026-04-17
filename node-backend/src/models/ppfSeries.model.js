module.exports = (sequelize, DataTypes) => {
  const PPFSeries = sequelize.define('PPFSeries', {
    ppf_series_id: {
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
    material_type: {
      type: DataTypes.ENUM('TPU', 'TPH', 'PVC', 'PU'),
      defaultValue: 'TPU'
    },
    thickness_mil: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 7.5
    },
    finish_type: {
      type: DataTypes.ENUM('Clear Gloss', 'Clear Matte', 'Colored', 'Black High Gloss'),
      defaultValue: 'Clear Gloss'
    },
    self_healing: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hydrophobic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    warranty_years: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'PPFSeries',
    timestamps: false
  });

  PPFSeries.associate = (models) => {
    PPFSeries.hasMany(models.PPFServicePrice, {
      foreignKey: 'ppf_series_id',
      as: 'prices'
    });
  };

  return PPFSeries;
};
