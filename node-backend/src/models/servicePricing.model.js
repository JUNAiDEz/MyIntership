module.exports = (sequelize, DataTypes) => {
  const ServicePricing = sequelize.define(
    'ServicePricing',
    {
      service_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      car_model_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'ข้อความหมายเหตุ เช่น "แถมอบโอโซนฟรี", "รวมอะไหล่"'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: 'เปิด/ปิดราคาบางรุ่นชั่วคราว'
      }
    },
    {
      tableName: 'ServicePricing',
      timestamps: false
    }
  );

  return ServicePricing;
};
