module.exports = (sequelize, DataTypes) => {
  const ServiceImage = sequelize.define(
    'ServiceImage',
    {
      image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
      image_url: { type: DataTypes.STRING(255), allowNull: false },
      alt_text: { type: DataTypes.STRING(255), allowNull: true },
      is_primary: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      tableName: 'ServiceImages',
      timestamps: false
    }
  );

  return ServiceImage;
};
