module.exports = (sequelize, DataTypes) => {
  const PortfolioProjectCategory = sequelize.define(
    'PortfolioProjectCategory',
    {
      project_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      portfolio_category_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false }
    },
    {
      tableName: 'PortfolioProjectCategories',
      timestamps: false
    }
  );

  return PortfolioProjectCategory;
};
