module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object storing permissions: {"products": ["create","read"], "cars": ["read"]}'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Roles',
    timestamps: false
  });

  return Role;
};