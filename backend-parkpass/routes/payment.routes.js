const express = require('express');
const {
  processPayment,
  getPaymentStatus,
  getPaymentMethods
} = require('../controllers/payment.controller');

const router = express.Router();

// Public routes
router.post('/process', processPayment);
router.get('/methods', getPaymentMethods);
router.get('/:bookingId', getPaymentStatus);

module.exports = router;