module.exports = (sequelize, DataTypes) => {
  const PortfolioGallery = sequelize.define(
    'PortfolioGallery',
    {
      gallery_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      project_id: { type: DataTypes.INTEGER, allowNull: false },
      image_url: { type: DataTypes.STRING(255), allowNull: false },
      caption: { type: DataTypes.STRING(255), allowNull: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      tableName: 'PortfolioGallery',
      timestamps: false
    }
  );

  return PortfolioGallery;
};
