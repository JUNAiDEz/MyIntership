const multer = require('multer');
const path = require('path');

// เก็บไฟล์ไว้ใน memory ก่อน แล้วให้ controller แปลงเป็น WebP ด้วย sharp ก่อนเขียนลงดิสก์
// (ลดขนาดไฟล์ + ไม่ต้องเขียนไฟล์ต้นฉบับทิ้งภายหลัง)
const storage = multer.memoryStorage();

// ตัวกรองไฟล์ (รับเฉพาะรูปภาพ)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpeg, jpg, png, gif, webp) เท่านั้น!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
  fileFilter: fileFilter
});

module.exports = upload;
