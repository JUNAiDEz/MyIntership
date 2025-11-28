-- ==========================================================
-- MASTER SCRIPT: Garage Management System & Portfolio
-- ==========================================================
-- Migration from old schema to new test_db schema

CREATE DATABASE IF NOT EXISTS test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE test_db;

-- ==========================================================
-- 1. ส่วนจัดการสิทธิ์และผู้ใช้งาน (Authentication & Users)
-- ==========================================================

CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Customer, Technician, Manager, Admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,    -- เพิ่มมาใหม่ (NULL ได้)
    email VARCHAR(100) UNIQUE,      -- แก้ให้ NULL ได้ (ลบ NOT NULL ออก)
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);
CREATE INDEX idx_user_username ON Users(username); -- เพิ่ม index ให้ค้นหา username เร็วๆ
CREATE INDEX idx_user_email ON Users(email);

-- ==========================================================
-- 2. ส่วนข้อมูลหลัก (Master Data / Lookups)
-- ==========================================================

-- 2.1 หมวดหมู่ต่างๆ
CREATE TABLE ProductCategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES ProductCategories(category_id) ON DELETE SET NULL,
    INDEX idx_parent (parent_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ServiceCategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES ServiceCategories(category_id) ON DELETE SET NULL,
    INDEX idx_parent (parent_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 แบรนด์และคู่ค้า
CREATE TABLE ProductBrands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CarBrands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Toyota, Honda, BMW, etc.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. ส่วนข้อมูลบุคคลและรถยนต์ (Profiles & Vehicles)
-- ==========================================================

CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) COMMENT 'Technician, Cashier, etc.',
    phone_number VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CarModels (
    car_model_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL COMMENT 'Camry, Civic, D-Max, etc.',
    model_year INT,
    car_size ENUM('S', 'M', 'L', 'SUV', 'Truck') DEFAULT 'M',
    FOREIGN KEY (brand_id) REFERENCES CarBrands(brand_id) ON DELETE RESTRICT,
    INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    car_model_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vin_number VARCHAR(50) UNIQUE,
    color VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (car_model_id) REFERENCES CarModels(car_model_id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_license_plate (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 4. ส่วนแคตตาล็อกสินค้า (Product Catalog)
-- ==========================================================

-- 4.1 สินค้าแม่ (เก็บข้อมูลทั่วไป รีวิว รูป)
CREATE TABLE ProductTemplates (
    product_template_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    brand_id INT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES ProductCategories(category_id),
    FOREIGN KEY (brand_id) REFERENCES ProductBrands(brand_id),
    INDEX idx_category_id (category_id),
    INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2 สินค้าย่อย (เก็บ SKU, สต็อก, ราคา, รุ่นย่อย)
CREATE TABLE ProductVariants (
    product_variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_template_id INT NOT NULL,
    variant_name VARCHAR(100) COMMENT 'Front, Rear, Red, 1L, etc.',
    sku VARCHAR(100) UNIQUE,
    unit_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_template_id) REFERENCES ProductTemplates(product_template_id) ON DELETE CASCADE,
    INDEX idx_product_template_id (product_template_id),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ProductImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_template_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_template_id) REFERENCES ProductTemplates(product_template_id) ON DELETE CASCADE,
    INDEX idx_product_template_id (product_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.3 เชื่อมสินค้ากับ Supplier
CREATE TABLE ProductVariantSuppliers (
    product_variant_id INT NOT NULL,
    supplier_id INT NOT NULL,
    PRIMARY KEY (product_variant_id, supplier_id),
    FOREIGN KEY (product_variant_id) REFERENCES ProductVariants(product_variant_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 5. ส่วนบริการ (Services)
-- ==========================================================

CREATE TABLE Services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    base_labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES ServiceCategories(category_id),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ServiceImages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 6. ส่วนเชื่อมโยงและตรรกะราคา (Core Business Logic)
-- ==========================================================

-- 6.1 ราคาบริการ ตามรุ่นรถ
CREATE TABLE ServicePricing (
    service_id INT NOT NULL,
    car_model_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL COMMENT 'Price for specific car model',
    PRIMARY KEY (service_id, car_model_id),
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (car_model_id) REFERENCES CarModels(car_model_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.2 สูตรการผลิต (BOM): บริการนี้ ต้องเบิกสินค้าอะไร
CREATE TABLE ServiceProducts (
    service_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    PRIMARY KEY (service_id, product_variant_id),
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (product_variant_id) REFERENCES ProductVariants(product_variant_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 7. ส่วนโปรโมชั่น (Promotions)
-- ==========================================================

CREATE TABLE Promotions (
    promotion_id INT AUTO_INCREMENT PRIMARY KEY,
    promotion_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    promotion_type ENUM('PERCENT', 'FIXED_AMOUNT', 'BUNDLE') NOT NULL,
    discount_value DECIMAL(10, 2),
    start_date DATETIME,
    end_date DATETIME,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PromotionProducts (
    promotion_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    discounted_price DECIMAL(10, 2),
    PRIMARY KEY (promotion_id, product_variant_id),
    FOREIGN KEY (promotion_id) REFERENCES Promotions(promotion_id) ON DELETE CASCADE,
    FOREIGN KEY (product_variant_id) REFERENCES ProductVariants(product_variant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PromotionServices (
    promotion_id INT NOT NULL,
    service_id INT NOT NULL,
    discounted_price DECIMAL(10, 2),
    PRIMARY KEY (promotion_id, service_id),
    FOREIGN KEY (promotion_id) REFERENCES Promotions(promotion_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 8. ส่วนการขายและธุรกรรม (Transactions / Orders)
-- ==========================================================

CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    employee_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    sub_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE RESTRICT,
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE OrderServices (
    order_service_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    technician_id INT,
    agreed_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE RESTRICT,
    FOREIGN KEY (technician_id) REFERENCES Employees(employee_id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE OrderProducts (
    order_product_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    sold_price DECIMAL(10, 2) NOT NULL,
    order_service_id INT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_variant_id) REFERENCES ProductVariants(product_variant_id) ON DELETE RESTRICT,
    FOREIGN KEY (order_service_id) REFERENCES OrderServices(order_service_id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE OrderPromotions (
    order_id INT NOT NULL,
    promotion_id INT NOT NULL,
    PRIMARY KEY (order_id, promotion_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES Promotions(promotion_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 9. ส่วนรีวิว (Feedback)
-- ==========================================================

CREATE TABLE ProductReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_template_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_template_id) REFERENCES ProductTemplates(product_template_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    INDEX idx_product_template_id (product_template_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ServiceReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    INDEX idx_service_id (service_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 10. ส่วน Portfolio (ผลงานหน้าร้าน)
-- ==========================================================

CREATE TABLE PortfolioCategories (
    portfolio_category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Brake Upgrade, Remap, etc.',
    slug VARCHAR(100) UNIQUE,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PortfolioProjects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(255) NOT NULL,
    car_model_id INT,
    order_id INT,
    completion_date DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_model_id) REFERENCES CarModels(car_model_id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE SET NULL,
    INDEX idx_car_model_id (car_model_id),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PortfolioProjectCategories (
    project_id INT NOT NULL,
    portfolio_category_id INT NOT NULL,
    PRIMARY KEY (project_id, portfolio_category_id),
    FOREIGN KEY (project_id) REFERENCES PortfolioProjects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_category_id) REFERENCES PortfolioCategories(portfolio_category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PortfolioGallery (
    gallery_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES PortfolioProjects(project_id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 11. ส่วน Audit Logs (ต่อท้าย Master Script)
-- ==========================================================

CREATE TABLE AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                  -- ใครทำ (Link กับ Users)
    action VARCHAR(50) NOT NULL,  -- ทำอะไร (INSERT, UPDATE, DELETE)
    table_name VARCHAR(50) NOT NULL, -- ตารางไหน (Products, Orders)
    record_id INT NOT NULL,       -- ID ของแถวนั้นคืออะไร
    old_values JSON,              -- ค่าเก่า (ก่อนแก้)
    new_values JSON,              -- ค่าใหม่ (หลังแก้)
    ip_address VARCHAR(45),       -- IP Address
    user_agent TEXT,              -- Browser/Device
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- เชื่อม Foreign Key (ถ้า user ถูกลบ log จะยังอยู่ แต่ user_id จะเป็น NULL)
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- สร้าง Index ช่วยให้แอดมินกดดูประวัติแล้วโหลดไวขึ้น
CREATE INDEX idx_audit_user ON AuditLogs(user_id);
CREATE INDEX idx_audit_table ON AuditLogs(table_name);
CREATE INDEX idx_audit_date ON AuditLogs(created_at);

-- ==========================================================
-- INSERT DEFAULT ROLES
-- ==========================================================

INSERT INTO Roles (role_name) VALUES 
('Customer'),
('Admin');
