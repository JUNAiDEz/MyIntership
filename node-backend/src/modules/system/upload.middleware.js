const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตรวจสอบว่ามีโฟลเดอร์ uploads ไหม ถ้าไม่มีให้สร้าง
// ใช้ __dirname/../../public/uploads แทน __dirname/../public/uploads
const uploadDir = path.join(__dirname, '../../../public/uploads'); // ขึ้น 3 ระดับจาก src/modules/system

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
} else {
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // เก็บไฟล์ที่โฟลเดอร์ public/uploads
  },
  filename: (req, file, cb) => {
    // เปลี่ยนชื่อไฟล์เป็น: fieldname-timestamp.นามสกุล (ป้องกันชื่อซ้ำ)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

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