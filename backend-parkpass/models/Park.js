const mongoose = require('mongoose');

const ParkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a park name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  picture: {
    type: String,
    default: 'https://via.placeholder.com/100x100?text=No+Photo'
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify park capacity']
  },
  adultPrice: {
    type: Number,
    required: [true, 'Please add adult ticket price']
  },
  childPrice: {
    type: Number,
    required: [true, 'Please add child ticket price']
  },
  features: {
    type: [String],
    default: []
  },
  openingHours: {
    type: String,
    default: '9:00 AM - 5:00 PM'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ParkSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'park',
  justOne: false
});

module.exports = mongoose.model('Park', ParkSchema);
