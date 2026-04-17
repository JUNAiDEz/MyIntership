const db = require('../../models');
const StickerCar = db.StickerCar;

// Get all sticker cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await StickerCar.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(cars);
  } catch (error) {
    console.error('Error fetching sticker cars:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถ' });
  }
};

// Get single sticker car by ID
exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await StickerCar.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลรถ' });
    }
    
    res.json(car);
  } catch (error) {
    console.error('Error fetching sticker car:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถ' });
  }
};

// Create new sticker car
exports.createCar = async (req, res) => {
  try {
    // ต้องดึงค่าจาก req.body ออกมาก่อน ค่อยนำไป console.log ครับ
    const {
      name, description,
      base_image, paint_image,
      base_door_image, paint_door_image,
      base_fender_image, paint_fender_image,
      base_trunk_image, paint_trunk_image,
      base_hood_image, paint_hood_image,
      base_roof_image, paint_roof_image
    } = req.body;

    // Debug log หลังจากดึงค่าแล้ว
    if (base_roof_image) {
      console.log('[CREATE] base_roof_image length:', base_roof_image.length);
    }
    if (paint_roof_image) {
      console.log('[CREATE] paint_roof_image length:', paint_roof_image.length);
    }

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อรถ' });
    }

    const newCar = await StickerCar.create({
      name, description,
      base_image, paint_image,
      base_door_image, paint_door_image,
      base_fender_image, paint_fender_image,
      base_trunk_image, paint_trunk_image,
      base_hood_image, paint_hood_image,
      base_roof_image, paint_roof_image
    });

    res.status(201).json({
      message: 'สร้างข้อมูลรถสำเร็จ',
      data: newCar
    });
  } catch (error) {
    console.error('Error creating sticker car:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลรถ' });
  }
};

// Update sticker car
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ดึงค่าออกมาก่อน
    const {
      name, description,
      base_image, paint_image,
      base_door_image, paint_door_image,
      base_fender_image, paint_fender_image,
      base_trunk_image, paint_trunk_image,
      base_hood_image, paint_hood_image,
      base_roof_image, paint_roof_image
    } = req.body;

    // Debug log
    if (base_roof_image) {
      console.log('[UPDATE] base_roof_image length:', base_roof_image.length);
    }
    if (paint_roof_image) {
      console.log('[UPDATE] paint_roof_image length:', paint_roof_image.length);
    }

    const car = await StickerCar.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลรถ' });
    }

    await car.update({
      name, description,
      base_image, paint_image,
      base_door_image, paint_door_image,
      base_fender_image, paint_fender_image,
      base_trunk_image, paint_trunk_image,
      base_hood_image, paint_hood_image,
      base_roof_image, paint_roof_image
    });

    res.json({
      message: 'อัพเดทข้อมูลรถสำเร็จ',
      data: car
    });
  } catch (error) {
    console.error('Error updating sticker car:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลรถ' });
  }
};

// Delete sticker car
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await StickerCar.findByPk(id);
    
    if (!car) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลรถ' });
    }

    await car.destroy();
    res.json({ message: 'ลบข้อมูลรถสำเร็จ' });
  } catch (error) {
    console.error('Error deleting sticker car:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลรถ' });
  }
};