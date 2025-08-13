const Park = require('../models/Park');

// @desc    Get all parks
// @route   GET /api/parks
// @access  Public
exports.getParks = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Park.find(JSON.parse(queryStr)).populate('district');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Park.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const parks = await query;

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
      count: parks.length,
      pagination,
      data: parks
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get parks by district
// @route   GET /api/districts/:districtId/parks
// @access  Public
exports.getParksByDistrict = async (req, res) => {
  try {
    console.log('Getting parks for district:', req.params.districtId);
    const parks = await Park.find({ district: req.params.districtId }).populate('district');

    res.status(200).json({
      success: true,
      count: parks.length,
      data: parks
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single park
// @route   GET /api/parks/:id
// @access  Public
exports.getPark = async (req, res) => {
  try {
    const park = await Park.findById(req.params.id).populate('district');

    if (!park) {
      return res.status(404).json({
        success: false,
        message: `No park found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: park
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new park
// @route   POST /api/parks
// @access  Private/ParkAdmin
exports.createPark = async (req, res) => {
  try {
    // Add required field validation
    const requiredFields = ['name', 'location', 'capacity', 'adultPrice', 'childPrice'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }
    const park = await Park.create(req.body);

    res.status(201).json({
      success: true,
      data: park
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update park
// @route   PUT /api/parks/:id
// @access  Private/ParkAdmin
exports.updatePark = async (req, res) => {
  try {
    console.log('Update Park Request Body:', req.body);
    console.log('Update Park ID:', req.params.id);
    const park = await Park.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!park) {
      return res.status(404).json({
        success: false,
        message: `No park found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: park
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete park
// @route   DELETE /api/parks/:id
// @access  Private/ParkAdmin
exports.deletePark = async (req, res) => {
  try {
    const park = await Park.findById(req.params.id);

    if (!park) {
      return res.status(404).json({
        success: false,
        message: `No park found with id ${req.params.id}`
      });
    }

    // Use deleteOne() instead of deprecated remove()
    await park.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Park deleted successfully'
    });
  } catch (err) {
    console.error('Delete park error:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};