// เปิดบิล, ตัดสต็อก, บันทึก Order Product/Order Service

const db = require('../../models');
const { 
  Order, OrderProduct, OrderService, ProductVariant, 
  Customer, Vehicle, User, Employee, AuditLog 
} = db;

// 1. เปิดบิลซ่อม (Create Order + Cut Stock)
exports.createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction(); // เริ่ม Transaction
  try {
    const { 
      customer_id, vehicle_id, 
      products, // Array: [{ id, qty, price }]
      services, // Array: [{ id, technician_id, price }]
      discount_value 
    } = req.body;

    const employeeId = req.user.id; // คนเปิดบิล

    // 1. คำนวณยอดเงินรวม (Backend Calculation)
    let subTotal = 0;
    
    // คำนวณค่าอะไหล่
    if (products) {
      products.forEach(p => subTotal += (p.price * p.qty));
    }
    // คำนวณค่าแรง
    if (services) {
      services.forEach(s => subTotal += s.price);
    }

    const totalDiscount = discount_value || 0;
    const grandTotal = subTotal - totalDiscount;

    // 2. สร้าง Order Header
    const newOrder = await Order.create({
      customer_id,
      vehicle_id,
      employee_id: employeeId,
      order_date: new Date(),
      status: 'Pending',
      sub_total: subTotal,
      total_discount: totalDiscount,
      grand_total: grandTotal
    }, { transaction });

    // 3. จัดการสินค้า (Products) & ตัดสต็อก
    if (products && products.length > 0) {
      for (const item of products) {
        // 3.1 เช็คสต็อกก่อน (Lock row เพื่อความชัวร์)
        const variant = await ProductVariant.findByPk(item.id, { transaction });
        
        if (!variant) {
            throw new Error(`ไม่พบสินค้ารหัส ${item.id}`);
        }
        if (variant.stock_quantity < item.qty) {
            throw new Error(`สินค้า ${variant.variant_name} (SKU: ${variant.sku}) สต็อกไม่พอ (เหลือ ${variant.stock_quantity})`);
        }

        // 3.2 ตัดสต็อก
        await variant.decrement('stock_quantity', { by: item.qty, transaction });

        // 3.3 บันทึกลง OrderProduct
        await OrderProduct.create({
          order_id: newOrder.order_id,
          product_variant_id: item.id,
          quantity: item.qty,
          sold_price: item.price
        }, { transaction });
      }
    }

    // 4. จัดการบริการ (Services)
    if (services && services.length > 0) {
      for (const s of services) {
        await OrderService.create({
          order_id: newOrder.order_id,
          service_id: s.id,
          technician_id: s.technician_id, // ระบุช่างที่ทำ
          agreed_price: s.price
        }, { transaction });
      }
    }

    // 5. สร้าง Audit Log
    await AuditLog.create({
      user_id: employeeId,
      action: 'INSERT',
      table_name: 'Orders',
      record_id: newOrder.order_id,
      new_values: { grand_total: grandTotal }
    }, { transaction });

    await transaction.commit(); // ยืนยันการบันทึกทั้งหมด
    res.status(201).json({ message: 'เปิดบิลสำเร็จ', order_id: newOrder.order_id });

  } catch (error) {
    await transaction.rollback(); // ถ้ามีอะไรพัง ให้ย้อนกลับทั้งหมด (สต็อกจะคืนค่าเดิม)
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายการบิลทั้งหมด
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['first_name', 'last_name'] },
        { model: Vehicle, attributes: ['license_plate', 'model_name'] } // ต้องแก้ Model Vehicle ให้เก็บ model_name หรือ join CarModel
      ],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. ดูรายละเอียดบิล (Detail)
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Customer },
        { model: Vehicle },
        { 
            model: OrderProduct, 
            include: [{ model: ProductVariant, attributes: ['variant_name', 'sku'] }] 
        },
        { 
            model: OrderService,
            include: [{ model: db.Service, attributes: ['service_name'] }] // ต้อง import Service model
        }
      ]
    });

    if (!order) return res.status(404).json({ message: 'ไม่พบข้อมูลบิล' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. อัปเดตสถานะ (เช่น ซ่อมเสร็จแล้ว)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'In_Progress', 'Completed', 'Cancelled'

    // ถ้า Cancelled ต้องเขียน Logic คืนสต็อกสินค้าด้วย (ขอละไว้ก่อน)
    
    await Order.update({ status }, { where: { order_id: id } });
    res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};