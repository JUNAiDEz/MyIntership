const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StickerColor = sequelize.define('StickerColor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    color_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    color_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    css_filter: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'StickerColors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return StickerColor;
};
