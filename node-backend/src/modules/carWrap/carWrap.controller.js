const db = require('../../models');
const { 
  CarWrapProfile, WrapFilmSeries, WrapFilmColor, WrapServicePrice,
  PPFSeries, PPFServicePrice, CarModel, CarBrand 
} = db;
const { Op } = require('sequelize');

// ==================== CAR WRAP PROFILES ====================

// Get all car wrap profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const profiles = await CarWrapProfile.findAll({
      where,
      include: [{
        model: CarModel,
        as: 'car_model',
        include: [{ model: CarBrand, as: 'CarBrand' }]
      }]
    });

    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('getAllProfiles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get profile by car model ID
exports.getProfileByCarModel = async (req, res) => {
  try {
    const { car_model_id } = req.params;

    const profile = await CarWrapProfile.findOne({
      where: { car_model_id },
      include: [{
        model: CarModel,
        as: 'car_model',
        include: [{ model: CarBrand, as: 'CarBrand' }]
      }]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'ไม่พบโปรไฟล์' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('getProfileByCarModel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create profile
exports.createProfile = async (req, res) => {
  try {
    const profile = await CarWrapProfile.create(req.body);
    res.status(201).json({ success: true, message: 'สร้างโปรไฟล์สำเร็จ', data: profile });
  } catch (error) {
    console.error('createProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await CarWrapProfile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'ไม่พบโปรไฟล์' });
    }

    await profile.update(req.body);
    res.json({ success: true, message: 'อัปเดตโปรไฟล์สำเร็จ', data: profile });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await CarWrapProfile.destroy({ where: { profile_id: id } });
    res.json({ success: true, message: 'ลบโปรไฟล์สำเร็จ' });
  } catch (error) {
    console.error('deleteProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== WRAP FILM SERIES ====================

// Get all film series
exports.getAllSeries = async (req, res) => {
  try {
    const { finish_type, brand_name } = req.query;
    const where = {};
    if (finish_type) where.finish_type = finish_type;
    if (brand_name) where.brand_name = brand_name;

    const series = await WrapFilmSeries.findAll({
      where,
      include: [{ model: WrapFilmColor, as: 'colors', where: { is_active: true }, required: false }]
    });

    res.json({ success: true, data: series });
  } catch (error) {
    console.error('getAllSeries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get series with colors and prices
exports.getSeriesDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const series = await WrapFilmSeries.findByPk(id, {
      include: [
        { model: WrapFilmColor, as: 'colors', where: { is_active: true }, required: false },
        { 
          model: WrapServicePrice, 
          as: 'prices',
          include: [{ model: CarModel, as: 'car_model' }]
        }
      ]
    });

    if (!series) {
      return res.status(404).json({ success: false, message: 'ไม่พบซีรีส์' });
    }

    res.json({ success: true, data: series });
  } catch (error) {
    console.error('getSeriesDetail error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== WRAP COLORS ====================

// Get colors by series
exports.getColorsBySeries = async (req, res) => {
  try {
    const { series_id } = req.params;

    const colors = await WrapFilmColor.findAll({
      where: { series_id, is_active: true },
      include: [{ model: WrapFilmSeries, as: 'series' }]
    });

    res.json({ success: true, data: colors });
  } catch (error) {
    console.error('getColorsBySeries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create color
exports.createColor = async (req, res) => {
  try {
    const color = await WrapFilmColor.create(req.body);
    res.status(201).json({ success: true, message: 'เพิ่มสีสำเร็จ', data: color });
  } catch (error) {
    console.error('createColor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== WRAP PRICING ====================

// Get price for specific car model and series
exports.getWrapPrice = async (req, res) => {
  try {
    const { car_model_id, series_id } = req.query;

    const where = {};
    if (car_model_id) where.car_model_id = car_model_id;
    if (series_id) where.series_id = series_id;

    const prices = await WrapServicePrice.findAll({
      where,
      include: [
        { model: CarModel, as: 'car_model' },
        { model: WrapFilmSeries, as: 'series' }
      ]
    });

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('getWrapPrice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create wrap price
exports.createWrapPrice = async (req, res) => {
  try {
    const price = await WrapServicePrice.create(req.body);
    res.status(201).json({ success: true, message: 'เพิ่มราคาสำเร็จ', data: price });
  } catch (error) {
    console.error('createWrapPrice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PPF SERIES ====================

// Get all PPF series
exports.getAllPPFSeries = async (req, res) => {
  try {
    const { material_type, brand_name } = req.query;
    const where = {};
    if (material_type) where.material_type = material_type;
    if (brand_name) where.brand_name = brand_name;

    const series = await PPFSeries.findAll({ where });

    res.json({ success: true, data: series });
  } catch (error) {
    console.error('getAllPPFSeries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PPF PRICING ====================

// Get PPF price
exports.getPPFPrice = async (req, res) => {
  try {
    const { car_model_id, ppf_series_id } = req.query;

    const where = {};
    if (car_model_id) where.car_model_id = car_model_id;
    if (ppf_series_id) where.ppf_series_id = ppf_series_id;

    const prices = await PPFServicePrice.findAll({
      where,
      include: [
        { model: CarModel, as: 'car_model' },
        { model: PPFSeries, as: 'ppf_series' }
      ]
    });

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('getPPFPrice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create PPF price
exports.createPPFPrice = async (req, res) => {
  try {
    const price = await PPFServicePrice.create(req.body);
    res.status(201).json({ success: true, message: 'เพิ่มราคาสำเร็จ', data: price });
  } catch (error) {
    console.error('createPPFPrice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
