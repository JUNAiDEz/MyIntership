const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/database'); // ไฟล์ตั้งค่า DB ของคุณ

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port, // ✅ เพิ่มบรรทัดนี้! (สำคัญมากสำหรับ Port 3308)
  logging: false,
  timezone: '+07:00',
});

// 1. โหลด Models ทั้งหมดในโฟลเดอร์นี้
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && // ไม่เอาไฟล์ .hidden
      file !== 'index.js' &&     // ไม่เอาตัวเอง
      file.slice(-3) === '.js'   // เอาเฉพาะ .js
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. สร้างความสัมพันธ์ (Associations)
// ==========================================================
// Group 1: Auth & Users
// ==========================================================
db.Role.hasMany(db.User, { foreignKey: 'role_id' });
db.User.belongsTo(db.Role, { foreignKey: 'role_id', as: 'role' });

db.User.hasOne(db.Customer, { foreignKey: 'user_id', as: 'customer' });
db.Customer.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasOne(db.Employee, { foreignKey: 'user_id', as: 'employee' });
db.Employee.belongsTo(db.User, { foreignKey: 'user_id' });

// ==========================================================
// Group 2: Inventory
// ==========================================================
db.ProductCategory.hasMany(db.ProductCategory, { foreignKey: 'parent_category_id', as: 'children' });
db.ProductCategory.belongsTo(db.ProductCategory, { foreignKey: 'parent_category_id', as: 'parent' });

db.ProductCategory.hasMany(db.ProductTemplate, { foreignKey: 'category_id' });
db.ProductTemplate.belongsTo(db.ProductCategory, { foreignKey: 'category_id', as: 'category' });

db.ProductBrand.hasMany(db.ProductTemplate, { foreignKey: 'brand_id' });
db.ProductTemplate.belongsTo(db.ProductBrand, { foreignKey: 'brand_id', as: 'brand' });

db.ProductTemplate.hasMany(db.ProductVariant, { foreignKey: 'product_template_id', as: 'variants' });
db.ProductVariant.belongsTo(db.ProductTemplate, { foreignKey: 'product_template_id', as: 'template' });

db.ProductTemplate.hasMany(db.ProductImage, { foreignKey: 'product_template_id', as: 'images' });
db.ProductImage.belongsTo(db.ProductTemplate, { foreignKey: 'product_template_id' });

db.ProductVariant.belongsToMany(db.Supplier, { through: db.ProductVariantSupplier, foreignKey: 'product_variant_id' });
db.Supplier.belongsToMany(db.ProductVariant, { through: db.ProductVariantSupplier, foreignKey: 'supplier_id' });

// ==========================================================
// Group 3: Services
// ==========================================================
db.ServiceCategory.hasMany(db.Service, { foreignKey: 'category_id' });
db.Service.belongsTo(db.ServiceCategory, { foreignKey: 'category_id', as: 'category' });

db.Service.hasMany(db.ServiceImage, { foreignKey: 'service_id', as: 'images' });
db.ServiceImage.belongsTo(db.Service, { foreignKey: 'service_id' });

db.Service.hasMany(db.ServicePricing, { foreignKey: 'service_id', as: 'pricings' });
db.ServicePricing.belongsTo(db.Service, { foreignKey: 'service_id' });
db.CarModel.hasMany(db.ServicePricing, { foreignKey: 'car_model_id' });
db.ServicePricing.belongsTo(db.CarModel, { foreignKey: 'car_model_id' });

db.Service.hasMany(db.ServiceProduct, { foreignKey: 'service_id', as: 'required_products' });
db.ServiceProduct.belongsTo(db.Service, { foreignKey: 'service_id' });
db.ProductVariant.hasMany(db.ServiceProduct, { foreignKey: 'product_variant_id' });
db.ServiceProduct.belongsTo(db.ProductVariant, { foreignKey: 'product_variant_id', as: 'product' });

// ==========================================================
// Group 4: Vehicles
// ==========================================================
db.CarBrand.hasMany(db.CarModel, { foreignKey: 'brand_id' });
db.CarModel.belongsTo(db.CarBrand, { foreignKey: 'brand_id' });

db.CarModel.hasMany(db.Vehicle, { foreignKey: 'car_model_id' });
db.Vehicle.belongsTo(db.CarModel, { foreignKey: 'car_model_id' });

db.Customer.hasMany(db.Vehicle, { foreignKey: 'customer_id', as: 'vehicles' });
db.Vehicle.belongsTo(db.Customer, { foreignKey: 'customer_id' });

// ==========================================================
// Group 5: Sales
// ==========================================================
db.Customer.hasMany(db.Order, { foreignKey: 'customer_id' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Vehicle.hasMany(db.Order, { foreignKey: 'vehicle_id' });
db.Order.belongsTo(db.Vehicle, { foreignKey: 'vehicle_id' });

db.Employee.hasMany(db.Order, { foreignKey: 'employee_id' });
db.Order.belongsTo(db.Employee, { foreignKey: 'employee_id', as: 'issuer' });

db.Order.hasMany(db.OrderProduct, { foreignKey: 'order_id' });
db.OrderProduct.belongsTo(db.Order, { foreignKey: 'order_id' });
db.ProductVariant.hasMany(db.OrderProduct, { foreignKey: 'product_variant_id' });
db.OrderProduct.belongsTo(db.ProductVariant, { foreignKey: 'product_variant_id' });

db.Order.hasMany(db.OrderService, { foreignKey: 'order_id' });
db.OrderService.belongsTo(db.Order, { foreignKey: 'order_id' });
db.Service.hasMany(db.OrderService, { foreignKey: 'service_id' });
db.OrderService.belongsTo(db.Service, { foreignKey: 'service_id' });
db.Employee.hasMany(db.OrderService, { foreignKey: 'technician_id' });
db.OrderService.belongsTo(db.Employee, { foreignKey: 'technician_id', as: 'technician' });

db.Promotion.belongsToMany(db.Order, { through: db.OrderPromotion, foreignKey: 'promotion_id' });
db.Order.belongsToMany(db.Promotion, { through: db.OrderPromotion, foreignKey: 'order_id' });

// ==========================================================
// Group 6: Portfolio & Reviews
// ==========================================================
db.CarModel.hasMany(db.PortfolioProject, { foreignKey: 'car_model_id' });
db.PortfolioProject.belongsTo(db.CarModel, { foreignKey: 'car_model_id', as: 'car_model' });

db.PortfolioProject.hasMany(db.PortfolioGallery, { foreignKey: 'project_id', as: 'gallery' });
db.PortfolioGallery.belongsTo(db.PortfolioProject, { foreignKey: 'project_id' });

db.PortfolioProject.belongsToMany(db.PortfolioCategory, { 
  through: db.PortfolioProjectCategory, 
  foreignKey: 'project_id',
  as: 'categories' 
});
db.PortfolioCategory.belongsToMany(db.PortfolioProject, { 
  through: db.PortfolioProjectCategory, 
  foreignKey: 'portfolio_category_id',
  as: 'projects'
});

db.ProductTemplate.hasMany(db.ProductReview, { foreignKey: 'product_template_id' });
db.ProductReview.belongsTo(db.ProductTemplate, { foreignKey: 'product_template_id' });

db.Service.hasMany(db.ServiceReview, { foreignKey: 'service_id' });
db.ServiceReview.belongsTo(db.Service, { foreignKey: 'service_id' });

db.Customer.hasMany(db.ProductReview, { foreignKey: 'customer_id' });
db.ProductReview.belongsTo(db.Customer, { foreignKey: 'customer_id' });

// ==========================================================
// Group 7: System
// ==========================================================
db.User.hasMany(db.AuditLog, { foreignKey: 'user_id' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'user_id' });

// 3. Export Database Object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;