// CRUD Customer, ดูประวัติรถลูกค้า

const db = require('../../models');
const { Customer, User, Vehicle, CarModel, CarBrand } = db;
const { Op } = require('sequelize');

// 1. ค้นหาลูกค้า (Search Bar หน้าเคาน์เตอร์)
exports.searchCustomers = async (req, res) => {
  try {
    const { search } = req.query; // รับค่า search (ชื่อ หรือ เบอร์โทร)
    
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['username', 'email'] } // ดูข้อมูล User ที่ผูกอยู่
      ],
      limit: 50 // กันข้อมูลโหลดเยอะเกิน
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายละเอียดลูกค้า + รถทั้งหมดของเขา
exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id, {
      include: [
        { model: User, attributes: ['email'] },
        { 
          model: Vehicle, 
          as: 'vehicles', // ต้องตั้ง association
          include: [
            { 
              model: CarModel, 
              include: [{ model: CarBrand }] 
            }
          ]
        }
      ]
    });

    if (!customer) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกค้า' });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. แก้ไขข้อมูลลูกค้า
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone_number, address } = req.body;

    await Customer.update(
      { first_name, last_name, phone_number, address },
      { where: { customer_id: id } }
    );

    res.json({ message: 'อัปเดตข้อมูลลูกค้าสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};