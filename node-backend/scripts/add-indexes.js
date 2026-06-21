// One-off: เพิ่ม DB index ที่คอลัมน์ filter บ่อย (idempotent — รันซ้ำได้)
// รัน: node scripts/add-indexes.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
require('dotenv').config();
const db = require('../src/models');

const INDEXES = [
  { table: 'ServicePricing', name: 'idx_sp_carmodel_active', cols: ['car_model_id', 'is_active'] },
  { table: 'ProductTemplates', name: 'idx_pt_active', cols: ['is_active'] },
  { table: 'ProductTemplates', name: 'idx_pt_slug', cols: ['slug'] },
  { table: 'BlogPosts', name: 'idx_bp_pub', cols: ['is_published', 'published_at'] },
  { table: 'BlogPosts', name: 'idx_bp_slug', cols: ['slug'] },
  { table: 'CarModels', name: 'idx_cm_slug', cols: ['slug'] },
  { table: 'CarModels', name: 'idx_cm_brand', cols: ['brand_id'] },
  { table: 'Faqs', name: 'idx_faq_slug', cols: ['slug'] },
  { table: 'Faqs', name: 'idx_faq_active', cols: ['is_active'] },
  { table: 'ProductImages', name: 'idx_pi_template', cols: ['product_template_id'] },
];

(async () => {
  const { sequelize } = db;
  const qi = sequelize.getQueryInterface();
  try {
    await sequelize.authenticate();
    for (const ix of INDEXES) {
      try {
        // index ชื่อนี้มีอยู่แล้ว? -> ข้าม (รันซ้ำได้)
        const byName = await sequelize.query(
          'SELECT 1 FROM information_schema.STATISTICS WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
          { replacements: [ix.table, ix.name], type: sequelize.QueryTypes.SELECT },
        );
        if (byName.length) { console.log(`⏭️  มีอยู่แล้ว: ${ix.table}.${ix.name}`); continue; }

        // คอลัมน์นำ (cols[0]) มี index นำอยู่แล้ว? -> ข้าม (เลี่ยง index ซ้ำกับ PK/unique/FK)
        const leadCols = await sequelize.query(
          'SELECT DISTINCT column_name AS c FROM information_schema.STATISTICS WHERE table_schema = DATABASE() AND table_name = ? AND seq_in_index = 1',
          { replacements: [ix.table], type: sequelize.QueryTypes.SELECT },
        );
        const leadSet = new Set(leadCols.map((r) => String(r.c)));
        if (ix.cols.length === 1 && leadSet.has(ix.cols[0])) {
          console.log(`⏭️  คอลัมน์มี index นำแล้ว: ${ix.table}(${ix.cols[0]})`);
          continue;
        }

        await qi.addIndex(ix.table, ix.cols, { name: ix.name });
        console.log(`✅ created: ${ix.table}.${ix.name} (${ix.cols.join(', ')})`);
      } catch (e) {
        console.error(`❌ FAILED ${ix.table}.${ix.name}: ${e.message}`);
      }
    }
  } finally {
    await sequelize.close();
  }
  process.exit(0);
})();
