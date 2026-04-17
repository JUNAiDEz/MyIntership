const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPermission = sequelize.define('UserPermission', {
    user_permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'permission_id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'UserPermissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'permission_id']
      }
    ]
  });

  return UserPermission;
};
