const path = require('path');

(async () => {
  try {
    // Ensure we load the app's models module
    const models = require(path.join(__dirname, '..', 'src', 'models'));
    const sequelize = models.sequelize;

    console.log('Authenticating DB connection...');
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // List all tables in the DB
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in DB:', tables);

    // Try loading a couple of models if they exist
    if (models.User) {
      console.log('Trying db.User.findOne()...');
      const user = await models.User.findOne({ raw: true });
      console.log('User sample:', user ? user : 'no rows');
    } else {
      console.log('Model User not found.');
    }

    if (models.ProductTemplate) {
      console.log('Trying db.ProductTemplate.findOne()...');
      const pt = await models.ProductTemplate.findOne({ raw: true });
      console.log('ProductTemplate sample:', pt ? pt : 'no rows');
    } else {
      console.log('Model ProductTemplate not found.');
    }

    console.log('All checks complete.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
