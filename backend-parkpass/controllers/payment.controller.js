const Booking = require('../models/Booking');
const Park = require('../models/Park');

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Public
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${bookingId}`
      });
    }

    // Check if payment is already completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this booking'
      });
    }

    // In a real application, you would integrate with a payment gateway like Stripe or PayPal here
    // For this demo, we'll simulate a successful payment

    // Generate a mock payment ID
    const paymentId = 'pm_' + Math.random().toString(36).substring(2, 15);

    // Update booking with payment information
    booking.paymentStatus = 'completed';
    booking.paymentId = paymentId;
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        booking,
        paymentId,
        message: 'Payment processed successfully'
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:bookingId
// @access  Public
exports.getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select('paymentStatus paymentId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.bookingId}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = async (req, res) => {
  try {
    // In a real application, this might come from a database or configuration
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Pay with Visa, Mastercard, or American Express',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        enabled: false // Not implemented in this demo
      }
    ];

    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};