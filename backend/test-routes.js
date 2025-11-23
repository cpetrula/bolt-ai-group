const express = require('express');

// Create a minimal app to test route registration
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and mount the telephony router
const telephonyRouter = require('./src/modules/telephony/telephony.routes');
app.use('/api', telephonyRouter);

// Function to list all routes
function listRoutes(app) {
  const routes = [];
  
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      // Route middleware
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      const routerPath = middleware.regexp.source
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace('^', '')
        .replace('$', '');
      
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: routerPath + handler.route.path
          });
        }
      });
    }
  });
  
  return routes;
}

const routes = listRoutes(app);
console.log('\nRegistered Routes:');
console.log('==================');
routes.forEach(route => {
  console.log(`${route.method.padEnd(6)} ${route.path}`);
});

// Check for the specific route
const targetRoute = '/api/webhooks/twilio/voice';
const found = routes.find(r => r.path === targetRoute && r.method === 'POST');
console.log(`\n${targetRoute} route ${found ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
