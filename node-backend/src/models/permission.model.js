module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Resource name: products, cars, services, orders, customers, users, etc.'
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'CRUD action: create, read, update, delete'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['resource', 'action'],
        name: 'unique_permission'
      }
    ]
  });

  return Permission;
};
