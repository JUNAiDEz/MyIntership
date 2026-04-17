module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define(
    'Supplier',
    {
      supplier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      supplier_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      contact_person: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    },
    {
      tableName: 'Suppliers',
      timestamps: false
    }
  );

  return Supplier;
};
