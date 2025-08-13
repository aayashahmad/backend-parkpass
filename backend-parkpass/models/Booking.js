const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  ticketNo: {
    type: String,
    default: () => uuidv4().substring(0, 8).toUpperCase(),
    unique: true
  },
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    required: true
  },
  visitorName: {
    type: String,
    required: [true, 'Please provide visitor name'],
    trim: true
  },
  visitorEmail: {
    type: String,
    required: [true, 'Please provide visitor email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  visitorPhone: {
    type: String,
    required: [true, 'Please provide visitor phone number']
  },
  adults: {
    type: Number,
    required: [true, 'Please add number of adults'],
    min: [0, 'Adults cannot be negative']
  },
  children: {
    type: Number,
    required: [true, 'Please add number of children'],
    min: [0, 'Children cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount']
  },
  visitDate: {
    type: Date,
    required: [true, 'Please add visit date']
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  isPrinted: {
    type: Boolean,
    default: false
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },

  // Usage tracking
  usedAt: {
    type: Date
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);