const express = require('express');
const {
  getTicketByNumber,
  generateTicket,
  markTicketAsPrinted
} = require('../controllers/booking.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes for ticket generation and printing
router.get('/:id', generateTicket);
router.put('/:id/print', markTicketAsPrinted);

// Protected routes for ticket checking
router.use(protect);
router.use(authorize('super-admin', 'park-admin', 'ticket-checker'));

router.get('/check/:ticketNo', getTicketByNumber);

module.exports = router;