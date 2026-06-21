// ลบ index ซ้ำที่เกิดจาก sequelize alter:true รันซ้ำทุก boot (เก็บ PRIMARY + 1 ตัวต่อชุดคอลัมน์)
// รัน: node scripts/dedup-indexes.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
require('dotenv').config();
const db = require('../src/models');

const TABLES = ['BlogPosts', 'Faqs', 'ContactMessages', 'ServiceBanners', 'ServiceButtons'];

(async () => {
  const { sequelize } = db;
  try {
    await sequelize.authenticate();
    for (const table of TABLES) {
      let rows;
      try {
        rows = await sequelize.query(
          'SELECT index_name, seq_in_index, column_name, non_unique FROM information_schema.STATISTICS WHERE table_schema = DATABASE() AND table_name = ? ORDER BY index_name, seq_in_index',
          { replacements: [table], type: sequelize.QueryTypes.SELECT },
        );
      } catch (e) { console.log(`${table}: skip (${e.message})`); continue; }
      if (!rows.length) { console.log(`${table}: ไม่มี index`); continue; }

      // รวมคอลัมน์ต่อ index
      const idx = {}; // name -> { cols:[], nonUnique }
      for (const r of rows) {
        const n = r.index_name;
        if (!idx[n]) idx[n] = { cols: [], nonUnique: r.non_unique };
        idx[n].cols[r.seq_in_index - 1] = r.column_name;
      }

      const bySig = {}; // signature(cols) -> [names]
      for (const [name, info] of Object.entries(idx)) {
        if (name === 'PRIMARY') continue;
        const sig = info.cols.join(',');
        (bySig[sig] ||= []).push({ name, nonUnique: Number(info.nonUnique) });
      }

      let dropped = 0;
      for (const [sig, group] of Object.entries(bySig)) {
        if (group.length <= 1) continue;
        // เก็บ unique ก่อน (non_unique=0) ไม่งั้นเก็บตัวแรก
        group.sort((a, b) => a.nonUnique - b.nonUnique || a.name.localeCompare(b.name));
        const keep = group[0];
        for (const g of group.slice(1)) {
          try {
            await sequelize.query(`DROP INDEX \`${g.name}\` ON \`${table}\``);
            dropped++;
          } catch (e) { console.error(`  ❌ drop ${table}.${g.name}: ${e.message}`); }
        }
        console.log(`  ${table} [${sig}] : เก็บ '${keep.name}', ลบซ้ำ ${group.length - 1} ตัว`);
      }
      console.log(`✅ ${table}: ลบ index ซ้ำ ${dropped} ตัว`);
    }
  } finally {
    await sequelize.close();
  }
  process.exit(0);
})();
