// จัดการ ProductTemplate + Variant + Image + Stock

const db = require('../../models');
const { 
  ProductTemplate, ProductVariant, ProductImage, 
  ProductBrand, ProductCategory, Supplier, ProductVariantSupplier 
} = db;
const { Op } = require('sequelize');

// 1. ดูสินค้าทั้งหมด (รองรับ Search & Filter)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category_id, brand_id, active } = req.query;

    // By default return all products (both active and inactive) for admin listing.
    // Use `?active=true` or `?active=false` to filter if needed.
    const whereClause = {};
    if (typeof active !== 'undefined') {
      whereClause.is_active = active === 'true';
    }
    if (search) {
      whereClause.product_name = { [Op.like]: `%${search}%` };
    }
    if (category_id) whereClause.category_id = category_id;
    if (brand_id) whereClause.brand_id = brand_id;

    const products = await ProductTemplate.findAll({
      where: whereClause,
      include: [
        { model: ProductBrand, as: 'brand' },
        { model: ProductCategory, as: 'category' },
        { 
          model: ProductImage, 
          as: 'images',
          where: { is_primary: true }, // ดึงเฉพาะรูปหลักมาโชว์ก่อน
          required: false 
        },
        {
          model: ProductVariant,
          as: 'variants', // ดึงราคาต่ำสุด-สูงสุดมาโชว์
          attributes: ['unit_price', 'stock_quantity']
        }
      ]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ดูรายละเอียดสินค้าเจาะจง (Product Detail Page)
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params; // product_template_id

    const product = await ProductTemplate.findByPk(id, {
      include: [
        { model: ProductBrand, as: 'brand' },
        { model: ProductCategory, as: 'category' },
        { model: ProductImage, as: 'images' }, // รูปทั้งหมด
        { 
          model: ProductVariant, 
          as: 'variants',
          where: { is_active: true } 
        }
      ]
    });

    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. สร้างสินค้าใหม่ (Complex Create with Transaction)
exports.createProduct = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { 
      product_name, description, category_id, brand_id, 
      images, // Array of image URLs ['url1', 'url2']
      variants // Array of objects [{ sku, name, price, cost, stock, supplier_id }]
    } = req.body;

    // A. สร้าง Product Template (แม่)
    const newTemplate = await ProductTemplate.create({
      product_name,
      description,
      category_id,
      brand_id,
      is_active: true
    }, { transaction });

    // B. บันทึกรูปภาพ (ถ้ามี)
    if (images && images.length > 0) {
      const imageData = images.map((url, index) => ({
        product_template_id: newTemplate.product_template_id,
        image_url: url,
        is_primary: index === 0 // รูปแรกเป็นรูปหลัก
      }));
      await ProductImage.bulkCreate(imageData, { transaction });
    }

    // C. สร้าง Product Variants (ลูก)
    if (variants && variants.length > 0) {
      for (const v of variants) {
        const newVariant = await ProductVariant.create({
          product_template_id: newTemplate.product_template_id,
          variant_name: v.name, // เช่น "สีแดง", "ขนาด XL"
          sku: v.sku,
          unit_price: v.price,
          cost_price: v.cost,
          stock_quantity: v.stock || 0
        }, { transaction });

        // D. ผูกกับ Supplier (ถ้าส่งมา)
        if (v.supplier_id) {
          await ProductVariantSupplier.create({
            product_variant_id: newVariant.product_variant_id,
            supplier_id: v.supplier_id
          }, { transaction });
        }
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', data: newTemplate });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

// 4. ปรับสต็อก (Stock Adjustment)
exports.adjustStock = async (req, res) => {
  try {
    const { variant_id, quantity, type } = req.body; // type: 'add' or 'reduce' or 'set'
    
    const variant = await ProductVariant.findByPk(variant_id);
    if (!variant) return res.status(404).json({ message: 'ไม่พบสินค้าย่อย' });

    if (type === 'add') {
      variant.stock_quantity += parseInt(quantity);
    } else if (type === 'reduce') {
      variant.stock_quantity -= parseInt(quantity);
    } else if (type === 'set') {
      variant.stock_quantity = parseInt(quantity);
    }

    await variant.save();
    res.json({ message: 'อัปเดตสต็อกสำเร็จ', current_stock: variant.stock_quantity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. แก้ไขข้อมูลสินค้า (แก้ ProductTemplate, รูปหลัก, และ variants เบื้องต้น)
exports.updateProduct = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params; // product_template_id
    const { product_name, description, category_id, brand_id, images, variants } = req.body;

    const product = await ProductTemplate.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    // อัปเดตข้อมูลหลัก
    product.product_name = product_name ?? product.product_name;
    product.description = description ?? product.description;
    product.category_id = category_id ?? product.category_id;
    product.brand_id = brand_id ?? product.brand_id;
    await product.save({ transaction });

    // อัปเดตรูปหลัก (ถ้ามี images array ส่งมา)
    if (images && images.length > 0) {
      const primaryUrl = images[0];
      // หา ProductImage หลัก
      const existingPrimary = await ProductImage.findOne({ where: { product_template_id: id, is_primary: true }, transaction });
      if (existingPrimary) {
        existingPrimary.image_url = primaryUrl;
        await existingPrimary.save({ transaction });
      } else {
        await ProductImage.create({ product_template_id: id, image_url: primaryUrl, is_primary: true }, { transaction });
      }
    }

    // อัปเดตหรือสร้าง variants (รองรับ id ใน variant object เพื่ออัปเดต)
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          const existing = await ProductVariant.findByPk(v.id, { transaction });
          if (existing) {
            existing.variant_name = v.variant_name ?? existing.variant_name;
            existing.unit_price = v.price ?? existing.unit_price;
            existing.cost_price = v.cost ?? existing.cost_price;
            existing.stock_quantity = typeof v.stock !== 'undefined' ? v.stock : existing.stock_quantity;
            existing.is_active = typeof v.is_active !== 'undefined' ? v.is_active : existing.is_active;
            await existing.save({ transaction });
            // supplier association update (simple): if supplier_id present, ensure mapping exists
            if (v.supplier_id) {
              await ProductVariantSupplier.findOrCreate({ where: { product_variant_id: existing.product_variant_id, supplier_id: v.supplier_id }, transaction });
            }
          }
        } else {
          // MODIFIED: If caller didn't provide a variant id but the product
          // already has at least one variant, update that existing variant
          // instead of always creating a new one. This prevents creating
          // duplicate variants when the admin UI only edits the primary
          // variant (common case).
          const existingVariant = await ProductVariant.findOne({
            where: { product_template_id: id },
            order: [['product_variant_id', 'ASC']],
            transaction
          });

          if (existingVariant) {
            existingVariant.variant_name = v.variant_name ?? existingVariant.variant_name;
            existingVariant.sku = v.sku ?? existingVariant.sku;
            existingVariant.unit_price = v.price ?? existingVariant.unit_price;
            existingVariant.cost_price = v.cost ?? existingVariant.cost_price;
            existingVariant.stock_quantity = typeof v.stock !== 'undefined' ? v.stock : existingVariant.stock_quantity;
            existingVariant.is_active = typeof v.is_active !== 'undefined' ? v.is_active : existingVariant.is_active;
            await existingVariant.save({ transaction });

            if (v.supplier_id) {
              await ProductVariantSupplier.findOrCreate({ where: { product_variant_id: existingVariant.product_variant_id, supplier_id: v.supplier_id }, transaction });
            }
          } else {
            // No existing variant found -> create new
            const newV = await ProductVariant.create({
              product_template_id: id,
              variant_name: v.variant_name || null,
              sku: v.sku || null,
              unit_price: v.price || 0,
              cost_price: v.cost || null,
              stock_quantity: v.stock || 0,
              is_active: typeof v.is_active !== 'undefined' ? v.is_active : true
            }, { transaction });
            if (v.supplier_id) {
              await ProductVariantSupplier.create({ product_variant_id: newV.product_variant_id, supplier_id: v.supplier_id }, { transaction });
            }
          }
        }
      }
    }

    await transaction.commit();
    res.json({ message: 'แก้ไขสินค้าสำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    console.error('updateProduct error', error);
    res.status(500).json({ message: error.message });
  }
};

// 6. Toggle product flags (is_popular, is_active)
exports.toggleProductFlags = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_popular, is_active } = req.body;

    const product = await ProductTemplate.findByPk(id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    let changed = false;
    if (typeof is_popular !== 'undefined') {
      product.is_popular = !!is_popular;
      changed = true;
    }
    if (typeof is_active !== 'undefined') {
      product.is_active = !!is_active;
      changed = true;
    }

    if (changed) await product.save();

    res.json({ message: 'อัปเดตสถานะสำเร็จ', data: { is_popular: product.is_popular, is_active: product.is_active } });
  } catch (error) {
    console.error('toggleProductFlags error', error);
    res.status(500).json({ message: error.message });
  }
};

// 7. Hard delete product (remove template + images + variants + variant-supplier mappings)
exports.hardDeleteProduct = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params; // product_template_id
    const product = await ProductTemplate.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    // Delete related variant-supplier mappings, variants, images, then template
    // First get variants for cleanup
    const variants = await ProductVariant.findAll({ where: { product_template_id: id }, transaction });
    const variantIds = variants.map(v => v.product_variant_id);

    if (variantIds.length > 0) {
      await ProductVariantSupplier.destroy({ where: { product_variant_id: variantIds }, transaction });
      await ProductVariant.destroy({ where: { product_variant_id: variantIds }, transaction });
    }

    await ProductImage.destroy({ where: { product_template_id: id }, transaction });
    await ProductTemplate.destroy({ where: { product_template_id: id }, transaction });

    await transaction.commit();
    res.json({ message: 'ลบสินค้าจากฐานข้อมูลสำเร็จ' });
  } catch (error) {
    await transaction.rollback();
    console.error('hardDeleteProduct error', error);
    res.status(500).json({ message: error.message });
  }
};