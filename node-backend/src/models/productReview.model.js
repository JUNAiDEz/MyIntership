module.exports = (sequelize, DataTypes) => {
  const ProductReview = sequelize.define(
    'ProductReview',
    {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_template_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'ProductReviews',
      timestamps: false
    }
  );

  return ProductReview;
};
