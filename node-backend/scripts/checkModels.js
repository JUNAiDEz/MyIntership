const path = require('path');

(async () => {
  try {
    // Ensure we load the app's models module
    const models = require(path.join(__dirname, '..', 'src', 'models'));
    const sequelize = models.sequelize;

    await sequelize.authenticate();

    // List all tables in the DB
    const tables = await sequelize.getQueryInterface().showAllTables();

    // Try loading a couple of models if they exist
    if (models.User) {
      const user = await models.User.findOne({ raw: true });
    } else {
    }

    if (models.ProductTemplate) {
      // ...removed log...
      const pt = await models.ProductTemplate.findOne({ raw: true });
      // ...removed log...
    } else {
      // ...removed log...
    }

    // ...removed log...
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
