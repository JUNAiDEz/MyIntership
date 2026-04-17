module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define(
    'Vehicle',
    {
      vehicle_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      car_model_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      license_plate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      vin_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true
      },
      color: {
        type: DataTypes.STRING(50),
        allowNull: true
      }
    },
    {
      tableName: 'Vehicles',
      timestamps: false
    }
  );

  return Vehicle;
};
