// จัดการ Project, Gallery, Category

const db = require('../../models');
const { 
  PortfolioProject, PortfolioCategory, PortfolioGallery, 
  CarModel, Order, PortfolioProjectCategory 
} = db;
const { Op } = require('sequelize');

// 1. ดึงผลงานทั้งหมด (พร้อม Filter หมวดหมู่/รถ)
exports.getAllProjects = async (req, res) => {
  try {
    const { category_id, car_model_id, is_featured } = req.query;
    
    // Where Condition
    const whereClause = { is_active: true };
    if (car_model_id) whereClause.car_model_id = car_model_id;
    if (is_featured) whereClause.is_featured = is_featured === 'true';

    // Include (Join)
    const includeOptions = [
      { model: CarModel, as: 'car_model', attributes: ['model_name'] },
      { 
        model: PortfolioCategory, 
        as: 'categories',
        through: { attributes: [] } // ไม่เอาตารางกลางมาโชว์
      }
    ];

    // ถ้ามีการกรองตาม Category ต้องใช้ Logic พิเศษนิดหน่อยเพราะเป็น Many-to-Many
    if (category_id) {
      includeOptions[1].where = { portfolio_category_id: category_id };
    }

    const projects = await PortfolioProject.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายละเอียดผลงาน (พร้อม Gallery รูปภาพทั้งหมด)
exports.getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await PortfolioProject.findByPk(id, {
      include: [
        { model: CarModel, as: 'car_model' },
        { model: PortfolioCategory, as: 'categories', through: { attributes: [] } },
        { model: PortfolioGallery, as: 'gallery' } // ดึงรูป Gallery
      ]
    });

    if (!project) return res.status(404).json({ message: 'ไม่พบผลงาน' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. สร้างผลงานใหม่ (Transaction: Project + Category Link + Gallery Images)
exports.createProject = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      title, description, cover_image_url, car_model_id, order_id, 
      completion_date, is_featured,
      category_ids, // Array of Category IDs [1, 2]
      gallery_images // Array of URLs ['url1', 'url2']
    } = req.body;

    // A. สร้าง Project หลัก
    const newProject = await PortfolioProject.create({
      title, description, cover_image_url, car_model_id, order_id,
      completion_date, is_featured, is_active: true
    }, { transaction });

    // B. ผูกหมวดหมู่ (Many-to-Many)
    if (category_ids && category_ids.length > 0) {
      // วิธี Manual Insert ลงตารางกลาง (หรือจะใช้ mixin methods ของ Sequelize ก็ได้)
      const categoryLinks = category_ids.map(catId => ({
        project_id: newProject.project_id,
        portfolio_category_id: catId
      }));
      await PortfolioProjectCategory.bulkCreate(categoryLinks, { transaction });
    }

    // C. บันทึกรูป Gallery
    if (gallery_images && gallery_images.length > 0) {
      const galleryData = gallery_images.map((url, index) => ({
        project_id: newProject.project_id,
        image_url: url,
        display_order: index + 1
      }));
      await PortfolioGallery.bulkCreate(galleryData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'สร้างผลงานสำเร็จ', data: newProject });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// 4. ลบผลงาน (Soft Delete หรือ Hard Delete ก็ได้ แล้วแต่ตกลง)
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        // Hard Delete ตาม SQL Script (Cascade จะลบ Gallery ให้เองถ้าตั้ง FK ไว้ถูก)
        await PortfolioProject.destroy({ where: { project_id: id } }); 
        res.json({ message: 'ลบผลงานสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (Update Project จะคล้าย Create แต่ใช้ update + destroy/create ตารางลูก)
exports.updateProject = async (req, res) => {
    // (ละไว้ในฐานที่เข้าใจ เพื่อความกระชับครับ Logic คือ Update Project -> ลบ Category เดิม -> ใส่ใหม่)
    res.status(501).json({ message: 'Not Implemented Yet' }); 
};