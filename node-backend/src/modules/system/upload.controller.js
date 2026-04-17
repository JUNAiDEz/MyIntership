// อัปโหลดไฟล์

exports.uploadFile = (req, res) => {
  try {
    
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    }

    
    // สร้าง URL สำหรับเข้าถึงไฟล์
    // เช่น http://localhost:3000/uploads/image-123456789.jpg
    const host = req.get('host');
    // ใช้ https สำหรับ production domain
    const protocol = host.includes('apigame.gt7dev.com') ? 'https' : req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;


    res.status(201).json({
      message: 'อัปโหลดสำเร็จ',
      url: fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};