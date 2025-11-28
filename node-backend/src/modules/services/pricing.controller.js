// จัดการ Service Pricing ตามรุ่นรถ

const db = require('../../models');
const { Service, ServicePricing, CarModel } = db;

// 1. คำนวณราคา (API สำหรับ Frontend เรียกเช็คราคา)
exports.calculatePrice = async (req, res) => {
  try {
    const { service_id, car_model_id } = req.body;

    // หาข้อมูล Service หลักก่อน (เอาค่าแรงพื้นฐาน)
    const service = await Service.findByPk(service_id);
    if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });

    let finalPrice = parseFloat(service.base_labor_cost);
    let note = 'ราคามาตรฐาน (Base Price)';

    // เช็คว่ามีการตั้งราคาพิเศษสำหรับรถรุ่นนี้ไหม?
    if (car_model_id) {
      const pricing = await ServicePricing.findOne({
        where: { service_id, car_model_id }
      });

      if (pricing) {
        finalPrice = parseFloat(pricing.price);
        note = 'ราคาเฉพาะรุ่นรถ';
      }
    }

    res.json({
      service_name: service.service_name,
      car_model_id,
      estimated_price: finalPrice,
      note
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ตั้งราคาเฉพาะรุ่น (Admin)
exports.setServicePrice = async (req, res) => {
  try {
    const { service_id, car_model_id, price } = req.body;

    // ใช้ Upsert (ถ้ามีให้อัปเดต ถ้าไม่มีให้สร้างใหม่)
    const [pricing, created] = await ServicePricing.upsert({
      service_id,
      car_model_id,
      price
    });

    res.json({ 
      message: created ? 'ตั้งราคาใหม่สำเร็จ' : 'อัปเดตราคาสำเร็จ',
      data: pricing 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};