// JWT secret กลาง — fail-fast บน production ถ้าไม่ตั้งค่า (กัน token ปลอมจาก default secret)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    // บน prod ห้าม boot ด้วย secret default เด็ดขาด
    throw new Error('FATAL: JWT_SECRET is not set. Refusing to start in production.');
  }
  console.warn('⚠️  JWT_SECRET ไม่ได้ตั้งค่า — ใช้ค่า dev ชั่วคราว (ห้ามใช้บน production!)');
}

module.exports = JWT_SECRET || 'dev-only-insecure-secret-change-me';
