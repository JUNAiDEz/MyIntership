// CRUD Vehicle, ผูกกับ Customer

const db = require('../../models');
const { Vehicle, Customer, CarModel, CarBrand } = db;
const { Op } = require('sequelize');

// 1. เพิ่มรถใหม่ (ผูกกับ Customer)
exports.addVehicle = async (req, res) => {
  try {
    const { 
      customer_id, car_model_id, 
      license_plate, vin_number, color 
    } = req.body;

    // เช็คทะเบียนซ้ำ
    const existingCar = await Vehicle.findOne({ where: { license_plate } });
    if (existingCar) {
      return res.status(400).json({ message: 'ทะเบียนรถนี้มีในระบบแล้ว' });
    }

    const newVehicle = await Vehicle.create({
      customer_id,
      car_model_id,
      license_plate,
      vin_number,
      color
    });

    res.status(201).json({ message: 'เพิ่มรถสำเร็จ', data: newVehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ค้นหาทะเบียนรถ (Search)
exports.searchVehicles = async (req, res) => {
  try {
    const { plate } = req.query;
    
    if (!plate) return res.status(400).json({ message: 'ระบุเลขทะเบียน' });

    const vehicles = await Vehicle.findAll({
      where: {
        license_plate: { [Op.like]: `%${plate}%` }
      },
      include: [
        { 
          model: Customer, 
          attributes: ['first_name', 'last_name', 'phone_number'] 
        },
        {
          model: CarModel,
          include: [{ model: CarBrand }]
        }
      ]
    });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. ดูรายละเอียดรถ 1 คัน
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id, {
      include: [
        { model: Customer },
        { model: CarModel, include: [{ model: CarBrand }] }
      ]
    });
    if (!vehicle) return res.status(404).json({ message: 'ไม่พบรถ' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. แก้ไขข้อมูลรถ
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { color, vin_number, license_plate } = req.body;

    await Vehicle.update(
      { color, vin_number, license_plate },
      { where: { vehicle_id: id } }
    );
    res.json({ message: 'อัปเดตข้อมูลรถสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};