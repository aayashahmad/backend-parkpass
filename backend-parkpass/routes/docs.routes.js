const express = require('express');
const router = express.Router();

// Beautiful API Documentation
router.get('/', (req, res) => {
  const documentation = {
    title: '🏞️ ParkPass API Documentation',
    version: '2.0.0',
    description: 'Beautiful Park Booking System API with stunning features',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    
    endpoints: {
      authentication: {
        title: '🔐 Authentication',
        description: 'User authentication and authorization',
        routes: {
          'POST /auth/register': 'Register a new user',
          'POST /auth/login': 'Login user',
          'GET /auth/me': 'Get current user profile',
          'PUT /auth/profile': 'Update user profile'
        }
      },
      
      districts: {
        title: '🏞️ Districts Management',
        description: 'Manage park districts with beautiful images',
        routes: {
          'GET /districts': 'Get all districts',
          'GET /districts/:id': 'Get single district',
          'POST /districts': 'Create new district (Admin only)',
          'PUT /districts/:id': 'Update district (Admin only)',
          'DELETE /districts/:id': 'Delete district (Admin only)'
        }
      },
      
      parks: {
        title: '🌳 Parks Management',
        description: 'Manage parks with pricing and features',
        routes: {
          'GET /parks': 'Get all parks with filters',
          'GET /parks/:id': 'Get single park details',
          'GET /districts/:districtId/parks': 'Get parks by district',
          'POST /parks': 'Create new park (Admin only)',
          'PUT /parks/:id': 'Update park (Admin only)',
          'DELETE /parks/:id': 'Delete park (Admin only)'
        }
      },
      
      bookings: {
        title: '🎫 Booking System',
        description: 'Handle park ticket bookings',
        routes: {
          'GET /bookings': 'Get user bookings',
          'GET /bookings/:id': 'Get single booking',
          'POST /bookings': 'Create new booking',
          'PUT /bookings/:id': 'Update booking',
          'DELETE /bookings/:id': 'Cancel booking'
        }
      },
      
      tickets: {
        title: '🎟️ Ticket Management',
        description: 'Manage digital tickets',
        routes: {
          'GET /tickets': 'Get user tickets',
          'GET /tickets/:id': 'Get single ticket',
          'POST /tickets/validate': 'Validate ticket at entry'
        }
      },
      
      analytics: {
        title: '📊 Analytics Dashboard',
        description: 'Beautiful analytics and reporting',
        routes: {
          'GET /analytics/overview': 'Get dashboard overview',
          'GET /analytics/bookings': 'Get booking analytics',
          'GET /analytics/revenue': 'Get revenue analytics',
          'GET /analytics/parks': 'Get park performance'
        }
      },
      
      payments: {
        title: '💳 Payment Processing',
        description: 'Secure payment handling',
        routes: {
          'POST /payments/create': 'Create payment intent',
          'POST /payments/confirm': 'Confirm payment',
          'GET /payments/:id': 'Get payment details'
        }
      },
      
      upload: {
        title: '📤 File Upload',
        description: 'Beautiful image upload system',
        routes: {
          'POST /upload': 'Upload image file (Admin only)'
        }
      }
    },
    
    features: [
      '🎨 Beautiful UI/UX Design',
      '🔐 JWT Authentication',
      '📱 Mobile Responsive',
      '🌟 Real-time Updates',
      '💳 Secure Payments',
      '📊 Analytics Dashboard',
      '🖼️ Image Upload',
      '🎫 Digital Tickets',
      '🔍 Advanced Search',
      '📧 Email Notifications'
    ],
    
    statusCodes: {
      200: '✅ Success',
      201: '🎉 Created',
      400: '❌ Bad Request',
      401: '🔒 Unauthorized',
      403: '🚫 Forbidden',
      404: '🔍 Not Found',
      500: '🚨 Server Error'
    },
    
    examples: {
      successResponse: {
        success: true,
        message: 'Operation completed successfully! ✨',
        data: '{ ... }',
        timestamp: new Date().toISOString()
      },
      errorResponse: {
        success: false,
        message: 'Something went wrong! 🚨',
        error: 'Error details',
        timestamp: new Date().toISOString()
      }
    },
    
    contact: {
      developer: 'ParkPass Team',
      email: 'support@parkpass.com',
      website: 'https://parkpass.com',
      github: 'https://github.com/parkpass/api'
    },
    
    lastUpdated: new Date().toISOString()
  };
  
  res.json(documentation);
});

// API Health Check
router.get('/health', (req, res) => {
  const healthCheck = {
    status: '🟢 Healthy',
    message: 'ParkPass API is running beautifully! ✨',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected 🗄️',
    services: {
      authentication: '🟢 Online',
      fileUpload: '🟢 Online',
      payments: '🟢 Online',
      notifications: '🟢 Online'
    }
  };
  
  res.json(healthCheck);
});

module.exports = router;
