// จัดการ Car Brand, Car Model

const db = require('../../models');
const { CarBrand, CarModel } = db;

// --- Brands ---
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await CarBrand.findAll();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;
    const newBrand = await CarBrand.create({ brand_name });
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name } = req.body;
    await CarBrand.update({ brand_name }, { where: { brand_id: id } });
    res.json({ message: 'อัปเดตยี่ห้อสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await CarBrand.destroy({ where: { brand_id: id } });
    res.json({ message: 'ลบยี่ห้อสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Models ---
exports.getAllModels = async (req, res) => {
  try {
    const { brand_id } = req.query;
    const whereClause = {};
    if (brand_id) whereClause.brand_id = brand_id;

    const models = await CarModel.findAll({
      where: whereClause,
      include: [{ model: CarBrand, attributes: ['brand_name'] }],
      order: [['model_name', 'ASC']]
    });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createModel = async (req, res) => {
  try {
    let { brand_id, model_name, model_year, car_size } = req.body;

    // Normalize car_size to canonical labels matching the frontend dropdown
    const canonical = {
      'sedan': 'Sedan',
      'sendan': 'Sedan',
      'hatchback': 'Hatchback',
      'coupe': 'Coupe',
      'convertible': 'Convertible',
      'station wagon': 'Station Wagon',
      'station_wagon': 'Station Wagon',
      'stationwagon': 'Station Wagon',
      'van': 'Van',
      'sport car': 'Sport Car',
      'sportcar': 'Sport Car',
      'suv': 'SUV',
      'truck': 'Truck',
      'sendan': 'Sedan'
    };
    if (car_size && typeof car_size === 'string') {
      const key = car_size.toLowerCase().trim();
      car_size = canonical[key] || (car_size.charAt(0).toUpperCase() + car_size.slice(1));
    }
    try { console.log('createModel: saving car_size ->', car_size); } catch(e) {}
    const newModel = await CarModel.create({ brand_id, model_name, model_year, car_size });
    res.status(201).json(newModel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    let { brand_id, model_name, model_year, car_size } = req.body;
    // Normalize car_size to canonical labels
    const canonical = {
      'sedan': 'Sedan',
      'sendan': 'Sedan',
      'hatchback': 'Hatchback',
      'coupe': 'Coupe',
      'convertible': 'Convertible',
      'station wagon': 'Station Wagon',
      'station_wagon': 'Station Wagon',
      'stationwagon': 'Station Wagon',
      'van': 'Van',
      'sport car': 'Sport Car',
      'sportcar': 'Sport Car',
      'suv': 'SUV',
      'truck': 'Truck'
    };
    if (car_size && typeof car_size === 'string') {
      const key = car_size.toLowerCase().trim();
      car_size = canonical[key] || (car_size.charAt(0).toUpperCase() + car_size.slice(1));
    }
    try { console.log('updateModel: saving car_size ->', car_size); } catch(e) {}
    await CarModel.update({ brand_id, model_name, model_year, car_size }, { where: { car_model_id: id } });
    res.json({ message: 'อัปเดตรุ่นรถสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    await CarModel.destroy({ where: { car_model_id: id } });
    res.json({ message: 'ลบรุ่นรถสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};