// --- ดึงข้อมูลราคาบริการ Sticker (Group by Brand) ---
exports.getStickerPricing = async (req, res) => {
  try {
    // หา service_id ของ Sticker (ค้นด้วย slug ก่อน ถ้าไม่เจอ fallback เป็นชื่อ)
    let stickerService = await Service.findOne({ where: { slug: 'sticker' }, attributes: ['service_id'] });
    if (!stickerService) {
      stickerService = await Service.findOne({ where: { service_name: { [Op.like]: '%Sticker%' } }, attributes: ['service_id'] });
    }
    if (!stickerService) return res.status(404).json({ message: 'ไม่พบบริการ Sticker' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: stickerService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Sticker',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Film Protect (Group by Brand) ---
exports.getFilmProtectPricing = async (req, res) => {
  try {
    // หา service_id ของ Film Protect (ค้นด้วย slug ก่อน ถ้าไม่เจอ fallback เป็นชื่อ)
    let filmProtectService = await Service.findOne({ where: { slug: 'film-protect' }, attributes: ['service_id'] });
    if (!filmProtectService) {
      filmProtectService = await Service.findOne({ where: { service_name: { [Op.like]: '%Film Protect%' } }, attributes: ['service_id'] });
    }
    if (!filmProtectService) return res.status(404).json({ message: 'ไม่พบบริการ Film Protect' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: filmProtectService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Film Protect',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Exhaust (Group by Brand) ---
exports.getExhaustPricing = async (req, res) => {
  try {
    // หา service_id ของ Exhaust (ค้นด้วย slug ก่อน ถ้าไม่เจอ fallback เป็นชื่อ)
    let exhaustService = await Service.findOne({ where: { slug: 'exhaust' }, attributes: ['service_id'] });
    if (!exhaustService) {
      exhaustService = await Service.findOne({ where: { service_name: 'Exhaust' }, attributes: ['service_id'] });
    }
    if (!exhaustService) return res.status(404).json({ message: 'ไม่พบบริการ Exhaust' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: exhaustService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Exhaust',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Boost Gauge (Group by Brand) ---
exports.getBoostGaugePricing = async (req, res) => {
  try {
    // หา service_id ของ Boost Gauge
    const boostService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Boost Gauge%' } },
      attributes: ['service_id']
    });
    if (!boostService) return res.status(404).json({ message: 'ไม่พบบริการ Boost Gauge' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: boostService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Boost Gauge',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Valve Service (Group by Brand) ---
exports.getValveServicePricing = async (req, res) => {
  try {
    // หา service_id ของ Valve Service
    const valveService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Valve Service%' } },
      attributes: ['service_id']
    });
    if (!valveService) return res.status(404).json({ message: 'ไม่พบบริการ Valve Service' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: valveService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Valve Service',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Turbo Inter (Group by Brand) ---
exports.getTurboInterPricing = async (req, res) => {
  try {
    // หา service_id ของ Turbo Inter
    const turboService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Turbo Inter%' } },
      attributes: ['service_id']
    });
    if (!turboService) return res.status(404).json({ message: 'ไม่พบบริการ Turbo Inter' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: turboService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Turbo Inter',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Remote Control (Group by Brand) ---
exports.getRemoteControlPricing = async (req, res) => {
  try {
    // หา service_id ของ Remote Control
    const remoteService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Remote Control%' } },
      attributes: ['service_id']
    });
    if (!remoteService) return res.status(404).json({ message: 'ไม่พบบริการ Remote Control' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: remoteService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Remote Control',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Remap (Group by Brand) ---
exports.getRemapPricing = async (req, res) => {
  try {
    // หา service_id ของ Remap
    const remapService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Remap%' } },
      attributes: ['service_id']
    });
    if (!remapService) return res.status(404).json({ message: 'ไม่พบบริการ Remap' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: remapService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Remap',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Custom Exhaust (Group by Brand) ---
exports.getCustomExhaustPricing = async (req, res) => {
  try {
    // หา service_id ของ Custom Exhaust
    const customExhaustService = await Service.findOne({
      where: { service_name: 'Custom Exhaust' },
      attributes: ['service_id']
    });
    if (!customExhaustService) return res.status(404).json({ message: 'ไม่พบบริการ Custom Exhaust' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: customExhaustService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Custom Exhaust',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Upgrade (Group by Brand) ---
exports.getUpgradePricing = async (req, res) => {
  try {
    // ตัวอย่าง response เปล่าๆ
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Wheels & Tires (Group by Brand) ---
exports.getWheelsTiresPricing = async (req, res) => {
  try {
    // หา service_id ของ Wheels & Tires
    const wheelsTiresService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Wheels & Tires%' } },
      attributes: ['service_id']
    });
    if (!wheelsTiresService) return res.status(404).json({ message: 'ไม่พบบริการ Wheels & Tires' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: wheelsTiresService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Wheels & Tires',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getWheelsTiresPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Suspension (Group by Brand) ---
exports.getSuspensionPricing = async (req, res) => {
  try {
    // หา service_id ของ Suspension
    const suspensionService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Suspension%' } },
      attributes: ['service_id']
    });
    if (!suspensionService) return res.status(404).json({ message: 'ไม่พบบริการ Suspension' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: suspensionService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Suspension',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getSuspensionPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};
// ไฟล์: node-backend/src/modules/services/services.controller.js

const db = require('../../models');
const { 
  Service, ServiceCategory, ServiceImage, 
  ServiceProduct, ProductVariant, CarModel, CarBrand, ServicePricing 
} = db;
const { Op } = require('sequelize');

// --- ดึงราคาบริการ "ทุกชนิด" ของรถรุ่นเดียว ด้วย query เดียว ---
// แทนการยิง 18 endpoint แล้วมา filter ฝั่ง client (ลดเหลือ 1 request)
// GET /api/services/pricing/by-car-model/:carModelId
exports.getPricingByCarModel = async (req, res) => {
  try {
    const { carModelId } = req.params;
    if (!carModelId) return res.status(400).json({ message: 'carModelId is required' });

    const pricings = await ServicePricing.findAll({
      where: { car_model_id: carModelId, is_active: true },
      include: [
        {
          model: Service,
          attributes: ['service_id', 'service_name', 'slug'],
          required: true,
          include: [{ model: ServiceImage, as: 'images', attributes: ['image_url'], required: false }],
        },
        {
          model: CarModel,
          as: 'CarModel',
          attributes: ['car_model_id', 'model_name', 'image_url', 'slug'],
          required: false,
        },
      ],
    });

    // คืนรูปแบบ flat ให้ frontend ใช้ได้ทันที (stage/name/price/service_slug/service_img/car_model_id)
    const result = pricings.map((p) => {
      const svc = p.Service || {};
      const serviceImg = (svc.images && svc.images[0] && svc.images[0].image_url) || '';
      return {
        id: `${p.service_id}-${p.car_model_id}`,
        car_model_id: p.car_model_id,
        service_id: p.service_id,
        price: Number(p.price),
        note: p.note || '',
        stage: svc.service_name || '',
        name: svc.service_name || '',
        service_slug: svc.slug || '',
        slug: svc.slug || '',
        service_img: serviceImg,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 1. ดึงข้อมูลราคาบริการ Pipe Clean (Group by Brand) ---
exports.getPipeCleanPricing = async (req, res) => {
  try {
    // หา service_id ของ Pipe Clean
    const pipeCleanService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Intake Cleaning%' } },
      attributes: ['service_id']
    });

    if (!pipeCleanService) return res.status(404).json({ message: 'ไม่พบบริการ Pipe Clean' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: pipeCleanService.service_id, is_active: true },
      include: [
        { 
          model: CarModel, 
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }] 
        }
      ]
    });

    // Group data using reduce (Optimized)
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Intake Cleaning',
        note: p.note || ''
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getPipeCleanPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- ดึงข้อมูลราคาบริการ AirCon (Group by Brand) ---
exports.getAirConPricing = async (req, res) => {
  try {
    // หา service_id ของ AirCon
    const airConService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Air-Con%' } },
      attributes: ['service_id']
    });

    if (!airConService) return res.status(404).json({ message: 'ไม่พบบริการ AirCon' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: airConService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'AirCon',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getAirConPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- ดึงข้อมูลราคาบริการ Fluid Change (Group by Brand) ---
exports.getFluidChangePricing = async (req, res) => {
  try {
    // หา service_id ของ Fluid Change
    const fluidChangeService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Fluid Change%' } },
      attributes: ['service_id']
    });
    if (!fluidChangeService) return res.status(404).json({ message: 'ไม่พบบริการ Fluid Change' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: fluidChangeService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Fluid Change',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getFluidChangePricing error:', error);
    res.status(500).json({ message: error.message });
  }
};
// --- ดึงข้อมูลราคาบริการ Engine Spa (Group by Brand) ---
exports.getEngineSpaPricing = async (req, res) => {
  try {
    // หา service_id ของ Engine Spa
    const engineSpaService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Engine Spa%' } },
      attributes: ['service_id']
    });
    if (!engineSpaService) return res.status(404).json({ message: 'ไม่พบบริการ Engine Spa' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: engineSpaService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Engine Spa',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getEngineSpaPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- ดึงข้อมูลราคาบริการ Alignment (Group by Brand) ---
exports.getAlignmentPricing = async (req, res) => {
  try {
    // หา service_id ของ Alignment
    const alignmentService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Alignment%' } },
      attributes: ['service_id']
    });
    if (!alignmentService) return res.status(404).json({ message: 'ไม่พบบริการ Alignment' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: alignmentService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Alignment',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getAlignmentPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- ดึงข้อมูลราคาบริการ Ball Joints (Group by Brand) ---
exports.getBallJointsPricing = async (req, res) => {
  try {
    // หา service_id ของ Ball Joints
    const ballJointsService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Ball Joints%' } },
      attributes: ['service_id']
    });
    if (!ballJointsService) return res.status(404).json({ message: 'ไม่พบบริการ Ball Joints' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: ballJointsService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Ball Joints',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getBallJointsPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- ดึงข้อมูลราคาบริการ Shock Absorber (Group by Brand) ---
exports.getShockAbsorberPricing = async (req, res) => {
  try {
    // หา service_id ของ Shock Absorber
    const shockAbsorberService = await Service.findOne({
      where: { service_name: { [Op.like]: '%Shock Absorber%' } },
      attributes: ['service_id']
    });
    if (!shockAbsorberService) return res.status(404).json({ message: 'ไม่พบบริการ Shock Absorber' });

    // Join ตารางเพื่อดึงราคาและรุ่นรถ
    const pricings = await ServicePricing.findAll({
      where: { service_id: shockAbsorberService.service_id, is_active: true },
      include: [
        {
          model: CarModel,
          as: 'CarModel',
          required: true,
          include: [{ model: CarBrand, as: 'brand', required: true }]
        }
      ]
    });

    // Group data using reduce
    const grouped = pricings.reduce((acc, p) => {
      const brandName = p.CarModel.brand.brand_name;
      if (!acc[brandName]) acc[brandName] = [];
      acc[brandName].push({
        name: p.CarModel.model_name,
        img: p.CarModel.image_url,
        price: Number(p.price),
        stage: 'Shock Absorber',
        note: p.note || '',
        car_model_id: p.CarModel.car_model_id
      });
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([brand, models]) => ({ brand, models }));
    res.json(result);
  } catch (error) {
    console.error('getShockAbsorberPricing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- 2. ดูรายการบริการทั้งหมด ---
exports.getAllServices = async (req, res) => {
  try {
    const { search, category_id, all } = req.query;
    const whereClause = {};

    // ถ้าไม่ใช่ Admin ขอมา (all=1) ให้ส่งไปเฉพาะ active=true
    if (!all || (all !== '1' && all !== 'true')) {
      whereClause.is_active = true;
    }

    if (search) whereClause.service_name = { [Op.like]: `%${search}%` };
    if (category_id) whereClause.category_id = category_id;

    const services = await Service.findAll({
      where: whereClause,
      include: [
        { model: ServiceCategory, as: 'category' }, // ต้องตรงกับ Model (as: 'category')
        { 
          model: ServiceImage, 
          as: 'images', // ต้องตรงกับ Model (as: 'images')
          where: { is_primary: true },
          required: false 
        }
      ],
      // ✅ แก้ไข: เรียงตาม service_id แทน createdAt เพื่อความปลอดภัย (กรณีปิด timestamps)
      order: [['service_id', 'DESC']] 
    });

    res.json(services);
  } catch (error) {
    console.error('getAllServices error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- 3. ดูรายละเอียดบริการ (และ BOM) ---
exports.getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id, {
      include: [
        { model: ServiceCategory, as: 'category' },
        { model: ServiceImage, as: 'images' },
        { 
          model: ServiceProduct, 
          as: 'required_products', 
          include: [{ 
            model: ProductVariant, 
            as: 'product',
            attributes: ['variant_name', 'sku', 'stock_quantity']
          }]
        }
      ]
    });

    if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. สร้างบริการใหม่ (Transaction) ---
exports.createService = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      service_name, slug, description, category_id, base_labor_cost, 
      images, required_products 
    } = req.body;

    // A. สร้าง Service
    const newService = await Service.create({
      service_name, slug, description, category_id, base_labor_cost, is_active: true
    }, { transaction });

    // B. บันทึกรูปภาพ
    if (images && images.length > 0) {
      const imgData = images.map((url, idx) => ({
        service_id: newService.service_id,
        image_url: url,
        is_primary: idx === 0
      }));
      await ServiceImage.bulkCreate(imgData, { transaction });
    }

    // C. บันทึก BOM (อะไหล่ที่ใช้)
    if (required_products && required_products.length > 0) {
      const bomData = required_products.map(item => ({
        service_id: newService.service_id,
        product_variant_id: item.product_variant_id,
        quantity_used: item.quantity || 1
      }));
      await ServiceProduct.bulkCreate(bomData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'สร้างบริการสำเร็จ', data: newService });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// --- 5. แก้ไขข้อมูลบริการ (Transaction + Validation) ---
exports.updateService = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      service_name, slug, description, category_id, base_labor_cost, 
      images, required_products, discount_percent, is_active, is_popular
    } = req.body;

    const service = await Service.findByPk(id, { transaction });
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
    }

    // Update fields
    await service.update({
      service_name, slug, description, category_id, base_labor_cost, 
      discount_percent, is_active, is_popular
    }, { transaction });

    // Update Images (Replace All Strategy)
    if (Array.isArray(images)) {
      await ServiceImage.destroy({ where: { service_id: id }, transaction });
      if (images.length > 0) {
        const imgData = images.map((url, idx) => ({ 
          service_id: id, image_url: url, is_primary: idx === 0 
        }));
        await ServiceImage.bulkCreate(imgData, { transaction });
      }
    }

    // Update BOM (Replace All Strategy)
    if (Array.isArray(required_products)) {
      await ServiceProduct.destroy({ where: { service_id: id }, transaction });
      if (required_products.length > 0) {
        const bomData = required_products.map(item => ({
          service_id: id,
          product_variant_id: item.product_variant_id,
          quantity_used: item.quantity || 1
        }));
        await ServiceProduct.bulkCreate(bomData, { transaction });
      }
    }

    await transaction.commit();
    res.json({ message: 'แก้ไขบริการสำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    console.error('updateService error', error);
    res.status(500).json({ message: error.message });
  }
};

// --- 6. ลบบริการ (Soft Delete) ---
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Service.update(
      { is_active: false }, 
      { where: { service_id: id } }
    );
    
    if (!updated) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
    
    res.json({ message: 'ลบบริการ (soft) เรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 7. Toggle Status ---
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
    
    service.is_active = !service.is_active;
    await service.save();
    
    res.json({ message: 'อัปเดตสถานะสำเร็จ', data: { is_active: service.is_active } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 8. Toggle Popular ---
exports.togglePopular = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
    
    service.is_popular = !service.is_popular;
    await service.save();
    
    res.json({ message: 'อัปเดต popular สำเร็จ', data: { is_popular: service.is_popular } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 9. Hard Delete ---
exports.hardDeleteService = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id, { transaction });
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
    }

    // ลบข้อมูลที่เกี่ยวข้องก่อน (Images, BOM)
    await ServiceImage.destroy({ where: { service_id: id }, transaction });
    await ServiceProduct.destroy({ where: { service_id: id }, transaction });
    await Service.destroy({ where: { service_id: id }, transaction });

    await transaction.commit();
    res.json({ message: 'ลบบริการออกจากฐานข้อมูลสำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};