const Booking = require('../models/Booking');
const Park = require('../models/Park');
const PDFDocument = require('pdfkit');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
  try {
    let query;

    // For park-admin, only show bookings for assigned parks
    if (req.user.role === 'park-admin') {
      query = Booking.find({ park: { $in: req.user.assignedParks } }).populate({
        path: 'park',
        populate: { path: 'district' }
      });
    } else {
      // For super-admin, show all bookings
      query = Booking.find().populate({
        path: 'park',
        populate: { path: 'district' }
      });
    }

    // Add filtering
    if (req.query.park) {
      query = query.find({ park: req.query.park });
    }

    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      query = query.find({
        visitDate: {
          $gte: date,
          $lt: nextDay
        }
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments();

    query = query.skip(startIndex).limit(limit).sort('-createdAt');

    // Execute query
    const bookings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination,
      data: bookings
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private/Admin
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'park',
      populate: { path: 'district' }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Check if user has access to this booking
    if (req.user.role === 'park-admin' && 
        !req.user.assignedParks.includes(booking.park._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { park: parkId, adults, children, visitorName, visitorEmail, visitorPhone, visitDate } = req.body;

    // Check if park exists
    const park = await Park.findById(parkId);

    if (!park) {
      return res.status(404).json({
        success: false,
        message: `No park found with id ${parkId}`
      });
    }

    // Calculate total amount
    const totalAmount = (adults * park.adultPrice) + (children * park.childPrice);

    // Create booking
    const booking = await Booking.create({
      park: parkId,
      adults,
      children,
      totalAmount,
      visitorName,
      visitorEmail,
      visitorPhone,
      visitDate: new Date(visitDate),
      status: 'active',
      paymentStatus: 'pending' // Will be updated after payment
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'used', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Check if user has access to this booking
    if (req.user.role === 'park-admin' && 
        !req.user.assignedParks.includes(booking.park)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Public
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status value'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get ticket by ticket number
// @route   GET /api/bookings/ticket/:ticketNo
// @access  Private/Admin
exports.getTicketByNumber = async (req, res) => {
  try {
    const booking = await Booking.findOne({ ticketNo: req.params.ticketNo }).populate({
      path: 'park',
      populate: { path: 'district' }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No ticket found with number ${req.params.ticketNo}`
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Generate ticket PDF
// @route   GET /api/bookings/:id/ticket
// @access  Public
exports.generateTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'park',
      populate: { path: 'district' }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Check if payment is completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed for this booking'
      });
    }

    // Create a PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.ticketNo}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('ParkPass Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Ticket No: ${booking.ticketNo}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Park: ${booking.park.name}`);
    doc.text(`District: ${booking.park.district.name}`);
    doc.text(`Visit Date: ${booking.visitDate.toDateString()}`);
    doc.text(`Adults: ${booking.adults}`);
    doc.text(`Children: ${booking.children}`);
    doc.text(`Total Amount: ₹${booking.totalAmount.toFixed(2)}`);
    doc.text(`Visitor: ${booking.visitorName}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();
    doc.text('Please present this ticket at the park entrance.', { align: 'center' });

    // Finalize the PDF
    doc.end();

    // Update booking status
    booking.isDownloaded = true;
    await booking.save();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Mark ticket as printed
// @route   PUT /api/bookings/:id/print
// @access  Public
exports.markTicketAsPrinted = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    booking.isPrinted = true;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Mark ticket as used (for entry validation)
// @route   PUT /api/bookings/ticket/:ticketNo/use
// @access  Private/Admin
exports.markTicketAsUsed = async (req, res) => {
  try {
    const booking = await Booking.findOne({ ticketNo: req.params.ticketNo }).populate({
      path: 'park',
      populate: { path: 'district' }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No ticket found with number ${req.params.ticketNo}`
      });
    }

    // Check if user has access to this booking's park
    if (req.user.role === 'park-admin' &&
        !req.user.assignedParks.includes(booking.park._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to validate this ticket'
      });
    }

    // Check if ticket is already used
    if (booking.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been used',
        data: booking
      });
    }

    // Check if ticket is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has been cancelled and cannot be used',
        data: booking
      });
    }

    // Mark ticket as used
    booking.status = 'used';
    booking.usedAt = new Date();
    booking.usedBy = req.user._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Ticket ${req.params.ticketNo} marked as used successfully`,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete ticket by ticket number
// @route   DELETE /api/bookings/ticket/:ticketNo
// @access  Private/Admin
exports.deleteTicketByNumber = async (req, res) => {
  try {
    const booking = await Booking.findOne({ ticketNo: req.params.ticketNo }).populate({
      path: 'park',
      populate: { path: 'district' }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No ticket found with number ${req.params.ticketNo}`
      });
    }

    // Check if user has access to this booking's park
    if (req.user.role === 'park-admin' &&
        !req.user.assignedParks.includes(booking.park._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this ticket'
      });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(booking._id);

    res.status(200).json({
      success: true,
      message: `Ticket ${req.params.ticketNo} deleted successfully - this ticket number can no longer be used`,
      data: booking
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};