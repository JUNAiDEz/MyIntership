// Script สำหรับรันคำสั่ง SQL Migration
// วิธีใช้: node migrations/run_user_permissions_migration.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = require('../src/config/database');

async function runMigration() {
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    // ...removed log...
  });

  try {
    await sequelize.authenticate();
    // ...removed log...

    // สร้างตาราง UserPermissions
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS UserPermissions (
        user_permission_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        permission_id INT NOT NULL,
        UNIQUE KEY unique_user_permission (user_id, permission_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // ...removed log...
    await sequelize.query(createTableSQL);
    // ...removed log...

    // ตรวจสอบว่าสร้างแล้วจริงหรือไม่
    const [results] = await sequelize.query('SHOW TABLES LIKE "UserPermissions"');
    if (results.length > 0) {
      // ...removed log...
      
      // แสดงโครงสร้างตาราง
      const [structure] = await sequelize.query('DESCRIBE UserPermissions');
      // ...removed log...
      console.table(structure);
    } else {
      // ...removed log...
    }

    await sequelize.close();
    // ...removed log...
    process.exit(0);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

runMigration();
