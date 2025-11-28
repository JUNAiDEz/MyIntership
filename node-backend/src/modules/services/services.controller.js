// CRUD Service + Image + BOM (ServiceProduct)

const db = require('../../models');
const { 
  Service, ServiceCategory, ServiceImage, 
  ServiceProduct, ProductVariant 
} = db;
const { Op } = require('sequelize');

// 1. ดูรายการบริการทั้งหมด
exports.getAllServices = async (req, res) => {
  try {
    const { search, category_id, all } = req.query;
    // By default return only active services for public listing.
    // If `?all=1` is provided (admin listing), return both active and inactive.
    const whereClause = {};
    if (!all || (all !== '1' && all !== 'true')) {
      whereClause.is_active = true;
    }

    if (search) whereClause.service_name = { [Op.like]: `%${search}%` };
    if (category_id) whereClause.category_id = category_id;

    const services = await Service.findAll({
      where: whereClause,
      include: [
        { model: ServiceCategory, as: 'category' },
        { 
          model: ServiceImage, 
          as: 'images',
          where: { is_primary: true },
          required: false 
        }
      ]
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายละเอียดบริการ (และอะไหล่ที่ต้องใช้)
exports.getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id, {
      include: [
        { model: ServiceCategory, as: 'category' },
        { model: ServiceImage, as: 'images' },
        { 
          model: ServiceProduct, 
          as: 'required_products', // BOM: บริการนี้ใช้อะไหล่อะไรบ้าง
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

// 3. สร้างบริการใหม่ (Transaction: Service + Images + BOM)
exports.createService = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      service_name, description, category_id, base_labor_cost, 
      images, // Array of URLs
      required_products // BOM Array: [{ product_variant_id: 1, quantity: 4 }]
    } = req.body;

    // A. สร้าง Service
    const newService = await Service.create({
      service_name, description, category_id, base_labor_cost, is_active: true
    }, { transaction });

    // B. บันทึกรูป
    if (images && images.length > 0) {
      const imgData = images.map((url, idx) => ({
        service_id: newService.service_id,
        image_url: url,
        is_primary: idx === 0
      }));
      await ServiceImage.bulkCreate(imgData, { transaction });
    }

    // C. บันทึกสูตรอะไหล่ (BOM)
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

  // 4. แก้ไขข้อมูลบริการ (Service + Images + BOM)
  exports.updateService = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params; // service_id
      const {
        service_name, description, category_id, base_labor_cost, images, required_products, discount_percent, is_active, is_popular
      } = req.body;

      const service = await Service.findByPk(id, { transaction });
      if (!service) {
        await transaction.rollback();
        return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
      }

      // Update main fields
      service.service_name = typeof service_name !== 'undefined' ? service_name : service.service_name;
      service.description = typeof description !== 'undefined' ? description : service.description;
      service.category_id = typeof category_id !== 'undefined' ? category_id : service.category_id;
      service.base_labor_cost = typeof base_labor_cost !== 'undefined' ? base_labor_cost : service.base_labor_cost;
      service.discount_percent = typeof discount_percent !== 'undefined' ? discount_percent : service.discount_percent;
      if (typeof is_active !== 'undefined') service.is_active = !!is_active;
      if (typeof is_popular !== 'undefined') service.is_popular = !!is_popular;
      await service.save({ transaction });

      // Images: replace existing entries if images array provided
      if (images && Array.isArray(images)) {
        await ServiceImage.destroy({ where: { service_id: id }, transaction });
        if (images.length > 0) {
          const imgData = images.map((url, idx) => ({ service_id: id, image_url: url, is_primary: idx === 0 }));
          await ServiceImage.bulkCreate(imgData, { transaction });
        }
      }

      // BOM (required_products): replace if provided
      if (required_products && Array.isArray(required_products)) {
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

  // 5. ลบบริการ (soft delete: set is_active = false)
  exports.deleteService = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
      service.is_active = false;
      await service.save();
      res.json({ message: 'ลบบริการ (soft) เรียบร้อย' });
    } catch (error) {
      console.error('deleteService error', error);
      res.status(500).json({ message: error.message });
    }
  };

  // 6. Toggle status (flip is_active)
  exports.toggleStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
      service.is_active = !service.is_active;
      await service.save();
      res.json({ message: 'อัปเดตสถานะสำเร็จ', data: { is_active: service.is_active } });
    } catch (error) {
      console.error('toggleStatus error', error);
      res.status(500).json({ message: error.message });
    }
  };

  // 7. Toggle popular flag (flip is_popular)
  exports.togglePopular = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
      service.is_popular = !service.is_popular;
      await service.save();
      res.json({ message: 'อัปเดต popular สำเร็จ', data: { is_popular: service.is_popular } });
    } catch (error) {
      console.error('togglePopular error', error);
      res.status(500).json({ message: error.message });
    }
  };

  // 8. Hard delete service (remove rows from DB)
  exports.hardDeleteService = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id, { transaction });
      if (!service) {
        await transaction.rollback();
        return res.status(404).json({ message: 'ไม่พบข้อมูลบริการ' });
      }

      // Remove related images and BOM, then delete service
      await ServiceImage.destroy({ where: { service_id: id }, transaction });
      await ServiceProduct.destroy({ where: { service_id: id }, transaction });
      await Service.destroy({ where: { service_id: id }, transaction });

      await transaction.commit();
      res.json({ message: 'ลบบริการออกจากฐานข้อมูลสำเร็จ' });
    } catch (error) {
      await transaction.rollback();
      console.error('hardDeleteService error', error);
      res.status(500).json({ message: error.message });
    }
  };