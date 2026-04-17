module.exports = (sequelize, DataTypes) => {
  const CarWrapProfile = sequelize.define('CarWrapProfile', {
    profile_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    car_model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'CarModels',
        key: 'model_id'
      }
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    base_image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    engine_rpm: {
      type: DataTypes.STRING(50),
      defaultValue: '3500'
    },
    engine_temp: {
      type: DataTypes.STRING(50),
      defaultValue: '90°C'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'CarWrapProfiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  CarWrapProfile.associate = (models) => {
    CarWrapProfile.belongsTo(models.CarModel, {
      foreignKey: 'car_model_id',
      as: 'car_model'
    });
  };

  return CarWrapProfile;
};
