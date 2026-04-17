module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
    {
      customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'Customers',
      timestamps: false
    }
  );

  return Customer;
};
