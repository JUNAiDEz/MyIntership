const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
const db = require('../src/models');
(async () => {
  for (const t of ['BlogPosts', 'Faqs', 'ContactMessages', 'ServiceBanners']) {
    try {
      const r = await db.sequelize.query(
        'SELECT COUNT(DISTINCT index_name) AS c FROM information_schema.STATISTICS WHERE table_schema = DATABASE() AND table_name = ?',
        { replacements: [t], type: db.sequelize.QueryTypes.SELECT },
      );
      console.log(`${t} = ${r[0].c} indexes`);
    } catch (e) { console.log(`${t} err: ${e.message}`); }
  }
  await db.sequelize.close();
  process.exit(0);
})();
