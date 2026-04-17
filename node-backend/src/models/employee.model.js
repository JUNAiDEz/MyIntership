module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    'Employee',
    {
      employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Roles',
          key: 'role_id'
        },
        comment: 'FK to Roles table (optional, can also get from Users table)'
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      phone_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'Employees',
      timestamps: false
    }
  );

  return Employee;
};
