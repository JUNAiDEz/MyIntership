module.exports = (sequelize, DataTypes) => {
  const CarModel = sequelize.define(
    'CarModel',
    {
      car_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      model_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      model_year: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      car_size: {
        // Allow flexible car type strings (Sendan, Hatchback, Coupe, etc.) instead of a restricted ENUM
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Sendan'
      }
    },
    {
      tableName: 'CarModels',
      timestamps: false
    }
  );

  return CarModel;
};
