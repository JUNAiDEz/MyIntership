// จัดการ Product Review, Service Review

const db = require('../../models');
const { ProductReview, ServiceReview, Customer, User } = db;

// --- Product Reviews ---

exports.createProductReview = async (req, res) => {
  try {
    const { product_template_id, order_id, rating, comment } = req.body;
    const userId = req.user.id; // จาก Token

    // หา Customer ID จาก User ID
    const customer = await Customer.findOne({ where: { user_id: userId } });
    if (!customer) return res.status(400).json({ message: 'ไม่พบข้อมูลลูกค้า' });

    // (ควรเช็คด้วยว่า Order นี้มีสินค้านี้จริงไหม แต่ข้ามไปก่อนเพื่อความง่าย)

    const newReview = await ProductReview.create({
      product_template_id,
      customer_id: customer.customer_id,
      order_id,
      rating,
      comment,
      is_approved: false // รอแอดมินอนุมัติ
    });

    res.status(201).json({ message: 'ส่งรีวิวสำเร็จ รอการตรวจสอบ', data: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params; // product_template_id
    const reviews = await ProductReview.findAll({
      where: { product_template_id: id, is_approved: true }, // เอาเฉพาะที่อนุมัติแล้ว
      include: [
        { model: Customer, attributes: ['first_name', 'last_name'] } // โชว์ชื่อคนรีวิว
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Service Reviews (Logic เดียวกัน) ---

exports.createServiceReview = async (req, res) => {
    // ... (คล้าย ProductReview เปลี่ยนแค่ตาราง)
    res.status(501).json({ message: 'Implement เหมือน ProductReview' });
};

exports.getServiceReviews = async (req, res) => {
     // ... (คล้าย ProductReview เปลี่ยนแค่ตาราง)
     res.status(501).json({ message: 'Implement เหมือน ProductReview' });
};

// --- Approve Review ---
exports.approveReview = async (req, res) => {
    try {
        const { type, id } = req.params; // type: 'product' or 'service'
        const { is_approved } = req.body;

        let model;
        if (type === 'product') model = ProductReview;
        else if (type === 'service') model = ServiceReview;
        else return res.status(400).json({ message: 'Type ไม่ถูกต้อง' });

        await model.update({ is_approved }, { where: { review_id: id } });
        res.json({ message: 'อัปเดตสถานะรีวิวสำเร็จ' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};