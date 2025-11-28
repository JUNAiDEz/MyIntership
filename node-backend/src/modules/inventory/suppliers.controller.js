// จัดการ Supplier + Product Variant Supplier

const db = require('../../models');
const { Supplier } = db;

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email } = req.body;
    const newSupplier = await Supplier.create({
      supplier_name, contact_person, phone, email
    });
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};