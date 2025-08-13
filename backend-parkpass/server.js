const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();


// Beautiful console logging
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  server: (msg) => console.log(`${colors.magenta}🚀 ${msg}${colors.reset}`),
  db: (msg) => console.log(`${colors.blue}🗄️ ${msg}${colors.reset}`)
};

// Check env variables
log.info('Checking environment variables...');
log.info(`MONGO_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
log.info(`PORT: ${process.env.PORT || 5001}`);

// Import routes
const authRoutes = require('./routes/auth.routes');
const districtRoutes = require('./routes/district.routes');
const parkRoutes = require('./routes/park.routes');
const bookingRoutes = require('./routes/booking.routes');

const ticketRoutes = require('./routes/ticket.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const paymentRoutes = require('./routes/payment.routes');
const uploadRoutes = require('./routes/upload.routes');
const docsRoutes = require('./routes/docs.routes');

// Initialize express app
const app = express();

// Beautiful Middleware Setup
log.info('Setting up middleware...');

// CORS with beautiful configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// JSON parsing with enhanced limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Beautiful request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      log.info(`🌐 ${message.trim()}`);
    }
  }
}));

log.success('Middleware configured successfully!');


// Beautiful Static File Serving
log.info('Setting up static file serving...');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
log.success('Static files ready! 📁');

// Beautiful API Routes Setup
log.info('Mounting API routes...');

const routes = [
  { path: '/api/auth', router: authRoutes, name: '🔐 Authentication' },
  { path: '/api/districts', router: districtRoutes, name: '🏞️ Districts' },
  { path: '/api/parks', router: parkRoutes, name: '🌳 Parks' },
  { path: '/api/bookings', router: bookingRoutes, name: '🎫 Bookings' },
  { path: '/api/tickets', router: ticketRoutes, name: '🎟️ Tickets' },
  { path: '/api/analytics', router: analyticsRoutes, name: '📊 Analytics' },
  { path: '/api/payments', router: paymentRoutes, name: '💳 Payments' },
  { path: '/api/upload', router: uploadRoutes, name: '📤 File Upload' },
  { path: '/api/docs', router: docsRoutes, name: '📚 Documentation' }
];

routes.forEach(route => {
  app.use(route.path, route.router);
  log.success(`${route.name} routes mounted at ${route.path}`);
});

log.success('All API routes configured! 🛣️');


// Beautiful Root Route
app.get('/', (req, res) => {
  const welcomeMessage = {
    message: '🌟 Welcome to ParkPass API!',
    description: 'Beautiful Park Booking System Backend',
    version: '2.0.0',
    status: 'Running smoothly! ✨',
    endpoints: {
      auth: '/api/auth',
      districts: '/api/districts',
      parks: '/api/parks',
      bookings: '/api/bookings',
      tickets: '/api/tickets',
      analytics: '/api/analytics',
      payments: '/api/payments',
      upload: '/api/upload'
    },
    documentation: 'Coming soon! 📚',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(welcomeMessage);
});

// Beautiful 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '🔍 Endpoint not found',
    suggestion: 'Check the API documentation for available endpoints',
    availableEndpoints: [
      '/api/auth',
      '/api/districts',
      '/api/parks',
      '/api/bookings',
      '/api/tickets',
      '/api/analytics',
      '/api/payments',
      '/api/upload'
    ]
  });
});

// Beautiful Error Handling Middleware
app.use((err, req, res, next) => {
  log.error(`Server Error: ${err.message}`);

  const errorResponse = {
    success: false,
    message: '🚨 Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  res.status(err.status || 500).json(errorResponse);
});

// Beautiful server startup
const PORT = process.env.PORT || 5001;

console.log(`\n${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                    🏞️  PARKPASS API SERVER                   ║
║                                                              ║
║  🌟 Beautiful Park Booking System Backend                   ║
║  🚀 Starting up with style...                               ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

log.db('Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    log.success('MongoDB Connected Successfully!');
    log.db('Database ready for beautiful park bookings! 🏞️');

    app.listen(PORT, () => {
      console.log(`\n${colors.bright}${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                    🎉 SERVER READY! 🎉                       ║
║                                                              ║
║  🌐 Server running on: http://localhost:${PORT}              ║
║  📊 Environment: ${process.env.NODE_ENV || 'development'}                           ║
║  🗄️  Database: Connected                                     ║
║  ✨ Status: All systems go!                                 ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

      log.server('ParkPass API is ready to serve beautiful park experiences! 🌟');
    });
  })
  .catch(err => {
    log.error('MongoDB Connection Failed!');
    console.error(`${colors.red}${err}${colors.reset}`);
    log.error('Server startup aborted. Please check your database connection.');
    process.exit(1);
  });
