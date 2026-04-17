// Sanitize base64 image string
function sanitizeBase64(str) {
  if (!str) return '';
  if (str.startsWith('data:')) {
    const commaIndex = str.indexOf(',');
    if (commaIndex !== -1) {
      const header = str.substring(0, commaIndex + 1);
      let content = str.substring(commaIndex + 1);
      if (content.includes(':')) content = content.split(':')[0];
      content = content.split(' ')[0];
      return header + content;
    }
  }
  return str.split(' ')[0];
}
// จัดการ Car Brand, Car Model

const db = require('../../models');
const { CarBrand, CarModel } = db;

// --- Brands ---
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await CarBrand.findAll();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      include: [{ model: CarBrand, attributes: ['brand_name'], as: 'brand' }],
      order: [['model_name', 'ASC']]
    });
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createModel = async (req, res) => {
  try {
    let { brand_id, model_name, model_year, car_size, image_url } = req.body;
  // Sanitize image_url before save
  if (image_url) image_url = sanitizeBase64(image_url);

    // Normalize car_size to uppercase for consistency
    if (car_size && typeof car_size === 'string') {
      car_size = car_size.trim().toUpperCase();
      
      // Map common variations
      const canonical = {
        'TRUCK': 'PICKUP',
        'PPV': 'SUV',
        'STATION WAGON': 'WAGON',
        'STATION_WAGON': 'WAGON',
        'STATIONWAGON': 'WAGON',
        // Keep old compatibility
        'S': 'SEDAN',
        'M': 'SEDAN',
        'L': 'SEDAN',
        'SMALL': 'SEDAN',
        'MEDIUM': 'SEDAN',
        'LARGE': 'SEDAN'
      };
      
      car_size = canonical[car_size] || car_size;
    }
    const newModel = await CarModel.create({ brand_id, model_name, model_year, car_size, image_url });
    res.status(201).json({ success: true, data: newModel });
  } catch (error) {
    console.error('createModel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    let { brand_id, model_name, model_year, car_size, image_url } = req.body;
      // Sanitize image_url before update
      if (image_url) image_url = sanitizeBase64(image_url);
    // Normalize car_size to uppercase for consistency
    if (car_size && typeof car_size === 'string') {
      car_size = car_size.trim().toUpperCase();
      
      // Map common variations
      const canonical = {
        'TRUCK': 'PICKUP',
        'PPV': 'SUV',
        'STATION WAGON': 'WAGON',
        'STATION_WAGON': 'WAGON',
        'STATIONWAGON': 'WAGON',
        // Keep old compatibility
        'S': 'SEDAN',
        'M': 'SEDAN',
        'L': 'SEDAN',
        'SMALL': 'SEDAN',
        'MEDIUM': 'SEDAN',
        'LARGE': 'SEDAN'
      };
      
      car_size = canonical[car_size] || car_size;
    }
    await CarModel.update({ brand_id, model_name, model_year, car_size, image_url }, { where: { car_model_id: id } });
    res.json({ success: true, message: 'อัปเดตรุ่นรถสำเร็จ' });
  } catch (error) {
    console.error('updateModel error:', error);
    res.status(500).json({ success: false, message: error.message });
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

// --- Get CarModel by slug ---
exports.getModelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const model = await CarModel.findOne({
      where: { slug },
      include: [{ model: CarBrand, attributes: ['brand_name'], as: 'brand' }]
    });
    if (!model) return res.status(404).json({ success: false, message: 'ไม่พบรุ่นรถนี้' });
    res.json({ success: true, data: model });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};