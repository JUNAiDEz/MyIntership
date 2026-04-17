module.exports = (sequelize, DataTypes) => {
  const CarModel = sequelize.define(
    'CarModel',
    {
      car_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      model_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      model_year: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      car_size: {
        // Car body type: SEDAN, SUV, PICKUP, HATCHBACK, VAN, COUPE, WAGON
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'SEDAN'
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'URL หรือ Base64 รูปภาพรุ่นรถ สำหรับแสดงใน Frontend Catalog'
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
        comment: 'SEO-friendly URL slug สำหรับ CarModel'
      }
    },
    {
      tableName: 'CarModels',
      timestamps: false
    }
  );

  return CarModel;
};
