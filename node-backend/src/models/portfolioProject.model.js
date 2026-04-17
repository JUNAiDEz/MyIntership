module.exports = (sequelize, DataTypes) => {
  const PortfolioProject = sequelize.define(
    'PortfolioProject',
    {
      project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cover_image_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      car_model_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      completion_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'PortfolioProjects',
      timestamps: false
    }
  );

  return PortfolioProject;
};
