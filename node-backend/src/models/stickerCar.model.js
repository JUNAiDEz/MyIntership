const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StickerCar = sequelize.define('StickerCar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 1. หลัก / กระจกมองข้าง
    base_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for main/mirror base layer'
    },
    paint_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for main/mirror paint layer'
    },
    // 2. ประตูรถ (Door) - [เพิ่มใหม่]
    base_door_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for door base layer'
    },
    paint_door_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for door paint layer'
    },
    // 3. แก้มข้าง (Fender) - [เพิ่มใหม่]
    base_fender_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for fender base layer'
    },
    paint_fender_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for fender paint layer'
    },
    // 4. ประตูท้าย (Trunk) - [เพิ่มใหม่]
    base_trunk_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for trunk base layer'
    },
    paint_trunk_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for trunk paint layer'
    },
    // 5. กระโปรงหน้า (Hood)
    base_hood_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for hood base layer'
    },
    paint_hood_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for hood paint layer'
    },
    // 6. หลังคา (Roof)
    base_roof_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for roof base layer'
    },
    paint_roof_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Base64 image for roof paint layer'
    }
  }, {
    tableName: 'StickerCars',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return StickerCar;
};