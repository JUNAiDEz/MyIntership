module.exports = (sequelize, DataTypes) => {
  const PortfolioCategory = sequelize.define(
    'PortfolioCategory',
    {
      portfolio_category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      category_name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(100), allowNull: true, unique: true },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName: 'PortfolioCategories',
      timestamps: false
    }
  );

  return PortfolioCategory;
};
