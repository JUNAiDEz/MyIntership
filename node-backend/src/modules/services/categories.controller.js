// จัดการ Service Category

const db = require('../../models');
const { ServiceCategory } = db;

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    const newCat = await ServiceCategory.create({ category_name });
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};