module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    role_permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'role_id'
      },
      onDelete: 'CASCADE'
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'permission_id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'RolePermissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permission_id'],
        name: 'unique_role_permission'
      }
    ]
  });

  return RolePermission;
};
