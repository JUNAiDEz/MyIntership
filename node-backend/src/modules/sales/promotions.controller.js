// ดึงโปรโมชั่นด้วย slug
exports.getPromotionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: 'Missing slug' });
    const promo = await Promotion.findOne({ where: { slug } });
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });
    res.json(promo);
  } catch (error) {
    console.error('getPromotionBySlug error:', error);
    res.status(500).json({ message: error.message });
  }
};
// สร้าง Promotion, Promotion Product, Promotion Service

const db = require('../../models');
const { Promotion, PromotionProduct, PromotionService, ProductVariant } = db;
const { Op } = require('sequelize');

// helper to coerce possible numeric strings
const toNumberOrNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ดึงโปรโมชั่นที่ยังไม่หมดอายุ
exports.getActivePromotions = async (req, res) => {
  try {
    // Admin can request all promotions with ?all=1
    const wantAll = req.query && (req.query.all === '1' || req.query.all === 'true');
    const search = req.query?.search?.toString().trim();

    // If admin asks for all, allow optional search filter
    if (wantAll) {
      const where = {};
      if (search) {
        const numeric = Number(search);
        where[Op.or] = [
          { promotion_name: { [Op.like]: `%${search}%` } },
          ...(Number.isFinite(numeric) ? [{ promotion_id: numeric }] : [])
        ];
      }
      const promos = await Promotion.findAll({ where });
      return res.json(promos);
    }

    // Default: only active & within date range, optionally filter by search term
    const now = new Date();
    const baseWhere = {
      is_active: true,
      start_date: { [Op.lte]: now }, // started
      end_date: { [Op.gte]: now }    // not ended
    };

    if (search) {
      const numeric = Number(search);
      baseWhere[Op.or] = [
        { promotion_name: { [Op.like]: `%${search}%` } },
        ...(Number.isFinite(numeric) ? [{ promotion_id: numeric }] : [])
      ];
    }

    const promos = await Promotion.findAll({ where: baseWhere });
    res.json(promos);
  } catch (error) {
    // Log full error server-side for debugging
    console.error('getActivePromotions error:', error);
    // Return stack in response temporarily to aid debugging (remove in production)
    res.status(500).json({ message: error.message });
  }
};

// สร้างโปรโมชั่นใหม่
exports.createPromotion = async (req, res) => {
  try {
    // Accept flexible payloads from frontend (title, promotion_price, imageUrl, items)

    const {
      promotion_name, title, description, promotion_type,
      discount_value, promotion_price, start_date, end_date, imageUrl, image_url, items, slug
    } = req.body;

    const name = promotion_name || title || 'Untitled Promotion';
    const value = discount_value ?? promotion_price ?? null;
    const type = promotion_type || (value != null ? 'FIXED_AMOUNT' : 'PERCENT');
    const img = image_url || imageUrl || null;
    const promoSlug = slug || name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Create promotion and optional item links inside a transaction
    const result = await db.sequelize.transaction(async (t) => {
      const newPromo = await Promotion.create({
        promotion_name: name,
        slug: promoSlug,
        description: description || null,
        promotion_type: type,
        discount_value: toNumberOrNull(value),
        start_date: start_date || null,
        end_date: end_date || null,
        image_url: img,
        is_active: true
      }, { transaction: t });

      // items: [{ item_id, item_type }]
      if (Array.isArray(items) && items.length > 0) {
        for (const it of items) {
          const iid = it.item_id;
          const itype = it.item_type;
          if (!iid || !itype) continue;

          if (itype === 'service') {
            await PromotionService.create({
              promotion_id: newPromo.promotion_id,
              service_id: iid,
              discounted_price: toNumberOrNull(value)
            }, { transaction: t });
          } else if (itype === 'product_variant') {
            await PromotionProduct.create({
              promotion_id: newPromo.promotion_id,
              product_variant_id: iid,
              discounted_price: toNumberOrNull(value)
            }, { transaction: t });
          } else if (itype === 'product') {
            // try to find a variant for this product template
            const variant = await ProductVariant.findOne({ where: { product_template_id: iid } , transaction: t });
            if (variant) {
              await PromotionProduct.create({
                promotion_id: newPromo.promotion_id,
                product_variant_id: variant.product_variant_id || variant.id,
                discounted_price: toNumberOrNull(value)
              }, { transaction: t });
            }
          }
        }
      }

      return newPromo;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('createPromotion error:', error);
    res.status(500).json({ message: error.message });
  }
  };

  // Update an existing promotion and replace its items
  exports.updatePromotion = async (req, res) => {
    const idParam = req.params.id;
    try {

      const {
        promotion_name, title, description, promotion_type,
        discount_value, promotion_price, start_date, end_date, imageUrl, image_url, items, slug
      } = req.body;

      const id = idParam || req.body.id || req.body.promotion_id;
      if (!id) return res.status(400).json({ message: 'Missing promotion id' });

      const promo = await Promotion.findOne({ where: { promotion_id: id } });
      if (!promo) return res.status(404).json({ message: 'Promotion not found' });

      const name = promotion_name || title || promo.promotion_name;
      const value = discount_value ?? promotion_price ?? promo.discount_value;
      const type = promotion_type || promo.promotion_type || (value != null ? 'FIXED_AMOUNT' : 'PERCENT');
      const img = image_url || imageUrl || promo.image_url;
      const promoSlug = slug || name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const result = await db.sequelize.transaction(async (t) => {
        await promo.update({
          promotion_name: name,
          slug: promoSlug,
          description: description ?? promo.description,
          promotion_type: type,
          discount_value: toNumberOrNull(value),
          start_date: start_date ?? promo.start_date,
          end_date: end_date ?? promo.end_date,
          image_url: img,
        }, { transaction: t });

        // remove existing links
        await PromotionService.destroy({ where: { promotion_id: promo.promotion_id }, transaction: t });
        await PromotionProduct.destroy({ where: { promotion_id: promo.promotion_id }, transaction: t });

        // recreate based on items
        if (Array.isArray(items) && items.length > 0) {
          for (const it of items) {
            const iid = it.item_id;
            const itype = it.item_type;
            if (!iid || !itype) continue;
            if (itype === 'service') {
              await PromotionService.create({ promotion_id: promo.promotion_id, service_id: iid, discounted_price: toNumberOrNull(value) }, { transaction: t });
            } else if (itype === 'product_variant') {
              await PromotionProduct.create({ promotion_id: promo.promotion_id, product_variant_id: iid, discounted_price: toNumberOrNull(value) }, { transaction: t });
            } else if (itype === 'product') {
              const variant = await ProductVariant.findOne({ where: { product_template_id: iid }, transaction: t });
              if (variant) {
                await PromotionProduct.create({ promotion_id: promo.promotion_id, product_variant_id: variant.product_variant_id || variant.id, discounted_price: toNumberOrNull(value) }, { transaction: t });
              }
            }
          }
        }

        return promo;
      });

      res.json(result);
    } catch (error) {
      console.error('updatePromotion error:', error);
      res.status(500).json({ message: error.message });
    }
  };

  // Hard-delete a promotion and its links
  exports.deletePromotion = async (req, res) => {
    const id = req.params.id || req.body.id || req.body.promotion_id;
    if (!id) return res.status(400).json({ message: 'Missing promotion id' });
    try {
      const promo = await Promotion.findOne({ where: { promotion_id: id } });
      if (!promo) return res.status(404).json({ message: 'Promotion not found' });

      await db.sequelize.transaction(async (t) => {
        await PromotionService.destroy({ where: { promotion_id: promo.promotion_id }, transaction: t });
        await PromotionProduct.destroy({ where: { promotion_id: promo.promotion_id }, transaction: t });
        await promo.destroy({ transaction: t });
      });

      res.json({ message: 'Promotion deleted' });
    } catch (error) {
      console.error('deletePromotion error:', error);
      res.status(500).json({ message: error.message });
    }
  };

  // Toggle promotion active status
  exports.togglePromotionStatus = async (req, res) => {
    const id = req.params.id || req.body.id || req.body.promotion_id;
    if (!id) return res.status(400).json({ message: 'Missing promotion id' });
    try {
      const promo = await Promotion.findOne({ where: { promotion_id: id } });
      if (!promo) return res.status(404).json({ message: 'Promotion not found' });
      promo.is_active = !promo.is_active;
      await promo.save();
      res.json({ promotion_id: promo.promotion_id, is_active: promo.is_active });
    } catch (error) {
      console.error('togglePromotionStatus error:', error);
      res.status(500).json({ message: error.message });
    }
  };