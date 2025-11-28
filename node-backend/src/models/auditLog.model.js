module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      action: { type: DataTypes.STRING(50), allowNull: false },
      table_name: { type: DataTypes.STRING(50), allowNull: false },
      record_id: { type: DataTypes.INTEGER, allowNull: false },
      old_values: { type: DataTypes.JSON, allowNull: true },
      new_values: { type: DataTypes.JSON, allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
      user_agent: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
      tableName: 'AuditLogs',
      timestamps: false,
      indexes: [
        { name: 'idx_audit_user', fields: ['user_id'] },
        { name: 'idx_audit_table', fields: ['table_name'] },
        { name: 'idx_audit_date', fields: ['created_at'] }
      ]
    }
  );

  return AuditLog;
};