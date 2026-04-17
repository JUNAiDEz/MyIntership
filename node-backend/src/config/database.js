require('dotenv').config(); 

module.exports = {
  // ดึงจาก .env เป็นหลัก ถ้าไม่มีให้ใช้ค่าสำหรับ Local เครื่องเปล่าๆ
  username: process.env.DB_USER || '', 
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  dialect: process.env.DB_DIALECT || 'mysql', 
  port: process.env.DB_PORT || 3306,
  logging: false, 
  timezone: '+07:00',
};