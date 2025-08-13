const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  updatePaymentStatus,
  getTicketByNumber,
  generateTicket,
  markTicketAsPrinted,
  markTicketAsUsed,
  deleteTicketByNumber
} = require('../controllers/booking.controller');

const { protect, authorize, checkParkAssignment } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', createBooking);
router.put('/:id/payment', updatePaymentStatus);
router.get('/:id/ticket', generateTicket);
router.put('/:id/print', markTicketAsPrinted);
router.get('/', getBookings);

// Protected routes
router.use(protect);

// Admin only routes
router.use(authorize('super-admin', 'park-admin', 'ticket-checker'));

router.get('/ticket/:ticketNo', getTicketByNumber);
router.put('/ticket/:ticketNo/use', markTicketAsUsed);
router.delete('/ticket/:ticketNo', deleteTicketByNumber);

// Check if user is assigned to park
router.use('/:id', checkParkAssignment);

router.get('/:id', getBooking);
router.put('/:id/status', updateBookingStatus);

module.exports = router;