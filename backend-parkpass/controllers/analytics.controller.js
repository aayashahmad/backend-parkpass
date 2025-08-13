const Booking = require('../models/Booking');
const Park = require('../models/Park');

// Helper function to get date range
const getDateRange = (period) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      startDate.setDate(1); // Start of month
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(now.getMonth() + 1, 0); // End of month
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      startDate.setMonth(0, 1); // Start of year (Jan 1)
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31); // End of year (Dec 31)
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

// @desc    Get sales data
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesData = async (req, res) => {
  try {
    const { period = 'daily', parkId } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Base query
    let query = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    };
    
    // Add park filter if provided
    if (parkId) {
      query.park = parkId;
    } else if (req.user.role === 'park-admin') {
      // For park-admin, only show data for assigned parks
      query.park = { $in: req.user.assignedParks };
    }
    
    // Get total sales amount
    const totalSales = await Booking.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Get sales by park
    const salesByPark = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$park', total: { $sum: '$totalAmount' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Populate park details
    const populatedSalesByPark = await Park.populate(salesByPark, {
      path: '_id',
      select: 'name district'
    });
    
    // Format the response
    const formattedSalesByPark = populatedSalesByPark.map(item => ({
      park: item._id,
      total: item.total
    }));
    
    // Get sales by date
    let groupByDate;
    if (period === 'daily') {
      groupByDate = {
        $group: {
          _id: { $hour: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      };
    } else if (period === 'weekly') {
      groupByDate = {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      };
    } else if (period === 'monthly') {
      groupByDate = {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      };
    } else {
      groupByDate = {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      };
    }
    
    const salesByDate = await Booking.aggregate([
      { $match: query },
      groupByDate,
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
        salesByPark: formattedSalesByPark,
        salesByDate
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get visitor data
// @route   GET /api/analytics/visitors
// @access  Private/Admin
exports.getVisitorData = async (req, res) => {
  try {
    const { period = 'daily', parkId } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Base query
    let query = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    };
    
    // Add park filter if provided
    if (parkId) {
      query.park = parkId;
    } else if (req.user.role === 'park-admin') {
      // For park-admin, only show data for assigned parks
      query.park = { $in: req.user.assignedParks };
    }
    
    // Get total visitors
    const totalVisitors = await Booking.aggregate([
      { $match: query },
      { $group: { 
          _id: null, 
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        } 
      }
    ]);
    
    // Get visitors by park
    const visitorsByPark = await Booking.aggregate([
      { $match: query },
      { $group: { 
          _id: '$park', 
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    // Populate park details
    const populatedVisitorsByPark = await Park.populate(visitorsByPark, {
      path: '_id',
      select: 'name district'
    });
    
    // Format the response
    const formattedVisitorsByPark = populatedVisitorsByPark.map(item => ({
      park: item._id,
      adults: item.adults,
      children: item.children,
      total: item.total
    }));
    
    // Get visitors by date
    let groupByDate;
    if (period === 'daily') {
      groupByDate = {
        $group: {
          _id: { $hour: '$createdAt' },
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        }
      };
    } else if (period === 'weekly') {
      groupByDate = {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        }
      };
    } else if (period === 'monthly') {
      groupByDate = {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        }
      };
    } else {
      groupByDate = {
        $group: {
          _id: { $month: '$createdAt' },
          adults: { $sum: '$adults' },
          children: { $sum: '$children' },
          total: { $sum: { $add: ['$adults', '$children'] } }
        }
      };
    }
    
    const visitorsByDate = await Booking.aggregate([
      { $match: query },
      groupByDate,
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        totalVisitors: totalVisitors.length > 0 ? {
          adults: totalVisitors[0].adults,
          children: totalVisitors[0].children,
          total: totalVisitors[0].total
        } : { adults: 0, children: 0, total: 0 },
        visitorsByPark: formattedVisitorsByPark,
        visitorsByDate
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get park popularity
// @route   GET /api/analytics/popularity
// @access  Private/Admin
exports.getParkPopularity = async (req, res) => {
  try {
    // Base query for completed bookings
    let query = { paymentStatus: 'completed' };
    
    // For park-admin, only show data for assigned parks
    if (req.user.role === 'park-admin') {
      query.park = { $in: req.user.assignedParks };
    }
    
    // Get bookings count by park
    const parkPopularity = await Booking.aggregate([
      { $match: query },
      { $group: { 
          _id: '$park', 
          bookingsCount: { $sum: 1 },
          visitorsCount: { $sum: { $add: ['$adults', '$children'] } },
          revenue: { $sum: '$totalAmount' }
        } 
      },
      { $sort: { visitorsCount: -1 } }
    ]);
    
    // Populate park details
    const populatedParkPopularity = await Park.populate(parkPopularity, {
      path: '_id',
      select: 'name district',
      populate: { path: 'district', select: 'name' }
    });
    
    // Format the response
    const formattedParkPopularity = populatedParkPopularity.map(item => ({
      park: item._id,
      bookingsCount: item.bookingsCount,
      visitorsCount: item.visitorsCount,
      revenue: item.revenue
    }));
    
    res.status(200).json({
      success: true,
      count: formattedParkPopularity.length,
      data: formattedParkPopularity
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Export sales report as CSV
// @route   GET /api/analytics/export/sales
// @access  Private/Admin
exports.exportSalesReport = async (req, res) => {
  try {
    const { period = 'monthly', parkId } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Base query
    let query = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    };
    
    // Add park filter if provided
    if (parkId) {
      query.park = parkId;
    } else if (req.user.role === 'park-admin') {
      // For park-admin, only show data for assigned parks
      query.park = { $in: req.user.assignedParks };
    }
    
    // Get bookings
    const bookings = await Booking.find(query)
      .populate({
        path: 'park',
        select: 'name district',
        populate: { path: 'district', select: 'name' }
      })
      .sort('createdAt');
    
    // Create CSV content
    let csv = 'Ticket No,Park,District,Visitor Name,Visitor Email,Adults,Children,Total Amount,Visit Date,Booking Date\n';
    
    bookings.forEach(booking => {
      csv += `${booking.ticketNo},"${booking.park.name}","${booking.park.district.name}","${booking.visitorName}",${booking.visitorEmail},${booking.adults},${booking.children},${booking.totalAmount},${booking.visitDate.toISOString().split('T')[0]},${booking.createdAt.toISOString().split('T')[0]}\n`;
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send CSV
    res.status(200).send(csv);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};