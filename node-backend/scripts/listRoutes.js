const path = require('path');
const { app } = require(path.join(__dirname, '..', 'src', 'app'));

function listRoutes(app) {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct route
      const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
      routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
          routes.push({ path: handler.route.path, methods });
        } else if (handler.name === 'router') {
          // nested router
        }
      });
    }
  });
  return routes;
}

const routes = listRoutes(app);
console.log('Registered routes:');
routes.forEach((r) => console.log(r.methods.padEnd(8), r.path));

// Also print the _router stack keys for debugging
console.log('\nRouter stack names:');
app._router.stack.forEach((s, i) => {
  console.log(i, s.name || '<anonymous>', s.regexp && s.regexp.source);
});
