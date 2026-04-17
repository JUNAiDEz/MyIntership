// ...existing code...
// ...existing code...
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

// Employee -> Role (optional direct link)
db.Role.hasMany(db.Employee, { foreignKey: 'role_id', as: 'employees' });
db.Employee.belongsTo(db.Role, { foreignKey: 'role_id', as: 'role' });

// Permissions (Many-to-Many: Roles <-> Permissions)
db.Role.belongsToMany(db.Permission, { 
  through: db.RolePermission, 
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissionsList'
});
db.Permission.belongsToMany(db.Role, { 
  through: db.RolePermission, 
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'rolesList'
});

// User Permissions (Many-to-Many: Users <-> Permissions)
db.User.belongsToMany(db.Permission, { 
  through: db.UserPermission, 
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'userPermissions'
});
db.Permission.belongsToMany(db.User, { 
  through: db.UserPermission, 
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'usersList'
});

// ==========================================================
// Group 2: Inventory
// ==========================================================
db.ProductCategory.hasMany(db.ProductCategory, { foreignKey: 'parent_category_id', as: 'children' });
db.ProductCategory.belongsTo(db.ProductCategory, { foreignKey: 'parent_category_id', as: 'parent' });


db.ProductCategory.hasMany(db.ProductTemplate, { foreignKey: 'category_id' });
db.ProductTemplate.belongsTo(db.ProductCategory, { foreignKey: 'category_id', as: 'category' });

db.ProductBrand.hasMany(db.ProductTemplate, { foreignKey: 'brand_id' });
db.ProductTemplate.belongsTo(db.ProductBrand, { foreignKey: 'brand_id', as: 'brand' });

// Add ProductType association
db.ProductType.hasMany(db.ProductTemplate, { foreignKey: 'product_type_id' });
db.ProductTemplate.belongsTo(db.ProductType, { foreignKey: 'product_type_id', as: 'ProductType' });

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

// ✅ แก้ไขส่วนความสัมพันธ์ของ Service Preview ให้รองรับตารางแบบไม่มี Constraint
db.Service.hasOne(db.ServicePreview, { 
  foreignKey: 'service_id', 
  as: 'preview_config',
  constraints: false 
});
db.ServicePreview.belongsTo(db.Service, { 
  foreignKey: 'service_id',
  constraints: false 
});

// ==========================================================
// Group 4: Vehicles
// ==========================================================
db.CarBrand.hasMany(db.CarModel, { foreignKey: 'brand_id', as: 'models' });
db.CarModel.belongsTo(db.CarBrand, { foreignKey: 'brand_id', as: 'brand' });

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

// ==========================================================
// Group 8: Car Wrap & PPF
// ==========================================================
// CarWrapProfile
db.CarModel.hasOne(db.CarWrapProfile, { foreignKey: 'car_model_id', as: 'wrap_profile' });
db.CarWrapProfile.belongsTo(db.CarModel, { foreignKey: 'car_model_id', as: 'car_model' });

// WrapFilmSeries -> WrapFilmColors
db.WrapFilmSeries.hasMany(db.WrapFilmColor, { foreignKey: 'series_id', as: 'colors' });
db.WrapFilmColor.belongsTo(db.WrapFilmSeries, { foreignKey: 'series_id', as: 'series' });

// WrapFilmColor -> ProductVariant (optional stock tracking)
db.ProductVariant.hasMany(db.WrapFilmColor, { foreignKey: 'product_variant_id' });
db.WrapFilmColor.belongsTo(db.ProductVariant, { foreignKey: 'product_variant_id', as: 'product' });

// WrapServicePrices
db.CarModel.hasMany(db.WrapServicePrice, { foreignKey: 'car_model_id', as: 'wrap_prices' });
db.WrapServicePrice.belongsTo(db.CarModel, { foreignKey: 'car_model_id', as: 'car_model' });

db.WrapFilmSeries.hasMany(db.WrapServicePrice, { foreignKey: 'series_id', as: 'prices' });
db.WrapServicePrice.belongsTo(db.WrapFilmSeries, { foreignKey: 'series_id', as: 'series' });

// PPF System
db.CarModel.hasMany(db.PPFServicePrice, { foreignKey: 'car_model_id', as: 'ppf_prices' });
db.PPFServicePrice.belongsTo(db.CarModel, { foreignKey: 'car_model_id', as: 'car_model' });

db.PPFSeries.hasMany(db.PPFServicePrice, { foreignKey: 'ppf_series_id', as: 'prices' });
db.PPFServicePrice.belongsTo(db.PPFSeries, { foreignKey: 'ppf_series_id', as: 'ppf_series' });

// ==========================================================
// Group: Sticker Management
// ==========================================================
// No associations needed - standalone tables

// 3. Export Database Object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ProductCarModel <-> CarModel
db.ProductCarModel.belongsTo(db.CarModel, { foreignKey: 'car_model_id', as: 'car_model' });
db.CarModel.hasMany(db.ProductCarModel, { foreignKey: 'car_model_id' });

// ProductCarModel <-> ProductTemplate
db.ProductCarModel.belongsTo(db.ProductTemplate, { foreignKey: 'product_template_id', as: 'product_template' });
db.ProductTemplate.hasMany(db.ProductCarModel, { foreignKey: 'product_template_id' });

module.exports = db;