const db = require('../../models'); 
const { 
  PortfolioProject, PortfolioCategory, PortfolioGallery, 
  CarModel, CarBrand, PortfolioProjectCategory 
} = db;
const { Op } = require('sequelize');

// ==========================================
// Helper Functions (ตัวช่วยกรองข้อมูลขยะ)
// ==========================================
const sanitizeInput = (val) => {
    // ถ้าเป็นตัวเลข หรือ string ที่แปลงเป็นตัวเลขได้ ให้คืนค่าตัวเลข
    if (val && !isNaN(parseInt(val)) && val !== "null" && val !== "undefined") {
        return parseInt(val);
    }
    // ถ้าเป็น "CR-V", "", "Invalid date" หรือขยะอื่นๆ ให้คืนค่า null
    return null;
};

const sanitizeDate = (val) => {
    // ถ้า date ใช้การได้ ให้คืนค่าเดิม, ถ้าเน่าให้คืน null
    if (val && val !== "" && val !== "Invalid date") return val;
    return null;
};

// ==========================================
// 1. ดึงข้อมูล (GET)
// ==========================================
exports.getAllProjects = async (req, res) => {
  try {
    const { category_id, car_model_id, is_featured, search } = req.query;
    const whereClause = { is_active: true };

    if (car_model_id) whereClause.car_model_id = car_model_id;
    if (is_featured) whereClause.is_featured = (is_featured === 'true' || is_featured === '1');
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const projects = await PortfolioProject.findAll({
      where: whereClause,
      include: [
        { 
          model: CarModel, as: 'car_model', attributes: ['model_id', 'model_name', 'model_year'],
          include: [{ model: CarBrand, as: 'CarBrand', attributes: ['brand_name'] }]
        },
        { model: PortfolioCategory, as: 'categories', through: { attributes: [] }, attributes: ['portfolio_category_id', 'category_name'] },
        { model: PortfolioGallery, as: 'gallery', attributes: ['image_url', 'caption'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await PortfolioProject.findByPk(id, {
      include: [
        { model: CarModel, as: 'car_model', include: [{ model: CarBrand, as: 'CarBrand' }] },
        { model: PortfolioCategory, as: 'categories', through: { attributes: [] } },
        { model: PortfolioGallery, as: 'gallery' }
      ]
    });
    if (!project) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. สร้างผลงาน (Create) - Safe Mode
// ==========================================
exports.createProject = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { category_ids, gallery_images, ...body } = req.body;

    const newProject = await PortfolioProject.create({
      title: body.title, 
      description: body.description, 
      cover_image_url: body.cover_image_url, 
      
      // ✅ FIX: ใช้ sanitizeInput เพื่อป้องกันค่า String หลุดเข้ามา
      car_model_id: sanitizeInput(body.car_model_id), 
      order_id: sanitizeInput(body.order_id),       
      completion_date: sanitizeDate(body.completion_date),

      is_featured: body.is_featured || false, 
      is_active: body.is_active !== undefined ? body.is_active : true
    }, { transaction });

    if (category_ids?.length) {
      await PortfolioProjectCategory.bulkCreate(
        category_ids.map(id => ({ project_id: newProject.project_id, portfolio_category_id: id })), 
        { transaction }
      );
    }

    if (gallery_images?.length) {
      await PortfolioGallery.bulkCreate(
        gallery_images.map((img, idx) => ({
            project_id: newProject.project_id,
            image_url: typeof img === 'object' ? img.image_url : img,
            caption: typeof img === 'object' ? img.caption : '',
            display_order: idx + 1
        })), 
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: 'บันทึกสำเร็จ', data: newProject });
  } catch (error) {
    await transaction.rollback();
    console.error('Create Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. แก้ไขผลงาน (Update) - Safe Mode
// ==========================================
exports.updateProject = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { category_ids, gallery_images, ...body } = req.body;

    const project = await PortfolioProject.findByPk(id, { transaction });
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' });
    }

    await project.update({
        title: body.title, 
        description: body.description, 
        cover_image_url: body.cover_image_url, 
        
        // ✅ FIX: ใช้ sanitizeInput เช่นกัน
        car_model_id: sanitizeInput(body.car_model_id),
        order_id: sanitizeInput(body.order_id),
        completion_date: sanitizeDate(body.completion_date),
        
        is_featured: body.is_featured, 
        is_active: body.is_active
      }, { transaction }
    );

    // Update Categories
    await PortfolioProjectCategory.destroy({ where: { project_id: id } }, { transaction });
    if (category_ids?.length) {
      await PortfolioProjectCategory.bulkCreate(
        category_ids.map(cid => ({ project_id: id, portfolio_category_id: cid })), 
        { transaction }
      );
    }

    // Update Gallery
    await PortfolioGallery.destroy({ where: { project_id: id } }, { transaction });
    if (gallery_images?.length) {
      await PortfolioGallery.bulkCreate(
        gallery_images.map((img, idx) => ({
            project_id: id,
            image_url: typeof img === 'object' ? img.image_url : img,
            caption: typeof img === 'object' ? img.caption : '',
            display_order: idx + 1
        })), 
        { transaction }
      );
    }

    await transaction.commit();
    res.json({ success: true, message: 'อัปเดตสำเร็จ', data: project });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } 
};

// ==========================================
// 4. ลบและอื่นๆ
// ==========================================
exports.deleteProject = async (req, res) => {
    try {
        await PortfolioProject.destroy({ where: { project_id: req.params.id } }); 
        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await PortfolioCategory.findAll({ where: { is_active: true } });
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};