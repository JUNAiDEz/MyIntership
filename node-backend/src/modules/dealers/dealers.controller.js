// dealers.controller.js
// Controller สำหรับ Dealer CRUD
const db = require('../../models');
const Dealer = db.Dealer;

// สร้าง Dealer ใหม่
exports.createDealer = async (req, res) => {
  try {
    const dealer = await Dealer.create(req.body);
    res.status(201).json(dealer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ดึง Dealer ทั้งหมด
exports.getAllDealers = async (req, res) => {
  try {
    const dealers = await Dealer.findAll();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดึง Dealer ตาม id
exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// อัปเดต Dealer
exports.updateDealer = async (req, res) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    await dealer.update(req.body);
    res.json(dealer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ลบ Dealer
exports.deleteDealer = async (req, res) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    await dealer.destroy();
    res.json({ message: 'Dealer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
