// ดู Logs

const db = require('../../models');
const { AuditLog, User, Role } = db;
const { Op } = require('sequelize');

exports.getAuditLogs = async (req, res) => {
  try {
    const { user_id, table_name, action, start_date, end_date } = req.query;
    
    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (table_name) whereClause.table_name = table_name; // เช่น 'Orders', 'Products'
    if (action) whereClause.action = action; // 'INSERT', 'UPDATE', 'DELETE'
    
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          attributes: ['username', 'email'],
          include: [{ model: Role, attributes: ['role_name'] }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100 // ดึงแค่ 100 รายการล่าสุด กันเครื่องค้าง
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByPk(id, {
      include: [{ model: User, attributes: ['username'] }]
    });
    
    if (!log) return res.status(404).json({ message: 'ไม่พบ Log' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};