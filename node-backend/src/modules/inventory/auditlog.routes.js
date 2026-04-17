const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../../middleware/auth');
const db = require('../../models');

// GET /api/inventory/products/:id/auditlog
router.get('/products/:id/auditlog', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    // ดึง AuditLog เฉพาะของสินค้านี้ (table_name = 'ProductTemplates' และ record_id = id)
    const logs = await db.AuditLog.findAll({
      where: {
        table_name: 'ProductTemplates',
        record_id: id
      },
      include: [{ model: db.User, attributes: ['username', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 50
    });
    res.json({ items: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
