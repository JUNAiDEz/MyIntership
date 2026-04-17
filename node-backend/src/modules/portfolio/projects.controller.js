const db = require('../../models');
const { 
  PortfolioProject, PortfolioCategory, PortfolioGallery, 
  CarModel, Order, PortfolioProjectCategory 
} = db;
const { Op } = require('sequelize');

// 1. ดึงผลงานทั้งหมด (เพิ่ม Search + Gallery)
exports.getAllProjects = async (req, res) => {
  try {
    const { category_id, car_model_id, is_featured, search } = req.query; // 👈 เพิ่ม search
    
    // Where Condition
    const whereClause = { is_active: true };
    
    if (car_model_id) whereClause.car_model_id = car_model_id;
    if (is_featured) whereClause.is_featured = is_featured === 'true';

    // 🔍 เพิ่ม Logic Search (ค้นหาจาก Title หรือ Description)
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Include (Join)
    const includeOptions = [
      { model: CarModel, as: 'car_model', attributes: ['model_name', 'model_year'] }, // เอาปีมาด้วย
      { 
        model: PortfolioCategory, 
        as: 'categories',
        through: { attributes: [] } 
      },
      // 👇 เพิ่ม Gallery เข้ามาด้วย เพราะ Frontend มีการ Map ข้อมูล gallery
      {
        model: PortfolioGallery,
        as: 'gallery',
        attributes: ['image_url', 'caption']
      }
    ];

    if (category_id) {
      includeOptions[1].where = { portfolio_category_id: category_id };
    }

    const projects = await PortfolioProject.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: projects }); // 👈 ปรับ return format ให้ตรง frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. ดูรายละเอียดผลงาน
exports.getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await PortfolioProject.findByPk(id, {
      include: [
        { model: CarModel, as: 'car_model' },
        { model: PortfolioCategory, as: 'categories', through: { attributes: [] } },
        { model: PortfolioGallery, as: 'gallery' }
      ]
    });

    if (!project) return res.status(404).json({ success: false, message: 'ไม่พบผลงาน' });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. สร้างผลงานใหม่
exports.createProject = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      title, slug, description, cover_image_url, car_model_id, order_id, 
      completion_date, is_featured, is_active,
      category_ids, 
      gallery_images // Frontend ส่งมาเป็น [{ image_url, caption }, ...]
    } = req.body;

    const newProject = await PortfolioProject.create({
      title, slug, description, cover_image_url, car_model_id, order_id,
      completion_date, is_featured, 
      is_active: is_active !== undefined ? is_active : true
    }, { transaction });

    // Link Categories
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map(catId => ({
        project_id: newProject.project_id,
        portfolio_category_id: catId
      }));
      await PortfolioProjectCategory.bulkCreate(categoryLinks, { transaction });
    }

    // Link Gallery (แก้ให้รองรับ Object จาก Frontend)
    if (gallery_images && gallery_images.length > 0) {
      const galleryData = gallery_images.map((item, index) => ({
        project_id: newProject.project_id,
        image_url: item.image_url || item, // 👈 รองรับทั้งแบบส่ง Object หรือ String กันพลาด
        caption: item.caption || '',        // 👈 เก็บ caption ด้วย
        display_order: index + 1
      }));
      await PortfolioGallery.bulkCreate(galleryData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: 'สร้างผลงานสำเร็จ', data: newProject });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ลบผลงาน
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await PortfolioProject.destroy({ where: { project_id: id } }); 
        res.json({ success: true, message: 'ลบผลงานสำเร็จ' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. อัปเดตผลงาน
exports.updateProject = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const {
      title, slug, description, cover_image_url, car_model_id, order_id,
      completion_date, is_featured, is_active,
      category_ids,
      gallery_images
    } = req.body;

    const project = await PortfolioProject.findByPk(id, { transaction });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'ไม่พบผลงาน' });
    }

    // Update ข้อมูลหลัก
    await project.update({
        title, slug, description, cover_image_url, car_model_id, order_id,
        completion_date, is_featured, is_active
      }, { transaction }
    );

    // Update Categories (ลบเก่า สร้างใหม่)
    await PortfolioProjectCategory.destroy({ where: { project_id: id } }, { transaction });
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map(catId => ({
        project_id: id,
        portfolio_category_id: catId
      }));
      await PortfolioProjectCategory.bulkCreate(categoryLinks, { transaction });
    }

    // Update Gallery (ลบเก่า สร้างใหม่ - เพื่อความง่ายในการจัดการ Order)
    await PortfolioGallery.destroy({ where: { project_id: id } }, { transaction });
    if (gallery_images && gallery_images.length > 0) {
      const galleryData = gallery_images.map((item, index) => ({
        project_id: id,
        image_url: item.image_url || item, // 👈 แก้ตรงนี้เหมือน create
        caption: item.caption || '',
        display_order: index + 1
      }));
      await PortfolioGallery.bulkCreate(galleryData, { transaction });
    }

    await transaction.commit();

    return res.json({ success: true, message: 'อัปเดตผลงานสำเร็จ', data: project });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  } 
};