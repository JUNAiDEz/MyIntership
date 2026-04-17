module.exports = (sequelize, DataTypes) => {
  const ServiceReview = sequelize.define(
    'ServiceReview',
    {
      review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName: 'ServiceReviews',
      timestamps: false
    }
  );

  return ServiceReview;
};
