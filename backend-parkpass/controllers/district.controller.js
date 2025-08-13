const District = require('../models/District');

// @desc    Get all districts
// @route   GET /api/districts
// @access  Public
exports.getDistricts = async (req, res) => {
  try {
    const districts = await District.find();

    res.status(200).json({
      success: true,
      message: '🏞️ Districts retrieved successfully!',
      count: districts.length,
      data: districts,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: '🚨 Failed to retrieve districts',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get single district
// @route   GET /api/districts/:id
// @access  Public
exports.getDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: `No district found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: district
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new district
// @route   POST /api/districts
// @access  Private/SuperAdmin
exports.createDistrict = async (req, res) => {
  try {
    const districtData = { ...req.body };

    // If an image was uploaded, add the image path
    if (req.file) {
      districtData.image = `/uploads/${req.file.filename}`;
    }

    const district = await District.create(districtData);

    res.status(201).json({
      success: true,
      message: '🎉 District created successfully!',
      data: district,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: '❌ Failed to create district',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Update district
// @route   PUT /api/districts/:id
// @access  Private/SuperAdmin
exports.updateDistrict = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If an image was uploaded, add the image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const district = await District.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!district) {
      return res.status(404).json({
        success: false,
        message: `No district found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: district
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete district
// @route   DELETE /api/districts/:id
// @access  Private/SuperAdmin
exports.deleteDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: `No district found with id ${req.params.id}`
      });
    }

    await district.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};