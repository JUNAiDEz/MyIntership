require('dotenv').config(); // ใส่กันเหนียวไว้ด้วยเผื่อมีการเรียกใช้ไฟล์นี้โดดๆ

module.exports = {
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '"ckss3Z-:vPu>Tj(-Nseq4oV#x]]S"', // ถ้าไม่มีรหัสให้เป็น string ว่าง
  database: process.env.DB_NAME || 'gt7_info',
  host: process.env.DB_HOST || 'gt7workmanagement.cx2o22k2sk2t.ap-southeast-1.rds.amazonaws.com',
  dialect: process.env.DB_DIALECT || 'mysql', // สำคัญ! ต้องมีค่านี้
  port: process.env.DB_PORT || 3306,
  logging: false, // ปิด log sql ใน console
  timezone: '+07:00',
};