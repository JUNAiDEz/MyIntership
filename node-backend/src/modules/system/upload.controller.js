// อัปโหลดไฟล์ — แปลงเป็น WebP ด้วย sharp ก่อนเก็บ (ลดขนาด ~50-70%)
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// public/uploads (ขึ้น 3 ระดับจาก src/modules/system) — ตรงกับที่ app เสิร์ฟ static /uploads
const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    }

    // ตั้งชื่อไฟล์ใหม่เป็น .webp กันชื่อซ้ำ
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `image-${uniqueSuffix}.webp`;
    const outPath = path.join(uploadDir, filename);

    // แปลง/บีบอัดเป็น WebP — animated:true เพื่อคง gif เคลื่อนไหว (static image ก็ทำงานปกติ)
    await sharp(req.file.buffer, { animated: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    // สร้าง URL สำหรับเข้าถึงไฟล์ เช่น http://localhost:5000/uploads/image-123.webp
    const host = req.get('host');
    // ใช้ https สำหรับ production domain
    const protocol = host.includes('apigame.gt7dev.com') ? 'https' : req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    res.status(201).json({
      message: 'อัปโหลดสำเร็จ',
      url: fileUrl,
      filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};
