const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token (handle both 'id' and 'sub' for compatibility)
    const userId = decoded.id || decoded.sub;
    req.user = await User.findById(userId);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is assigned to park
exports.checkParkAssignment = async (req, res, next) => {
  // Super admin can access all parks
  if (req.user.role === 'super-admin') {
    return next();
  }

  // For park-admin and ticket-checker, check if they are assigned to the park
  const parkId = req.params.id || req.body.park;
  
  if (!parkId) {
    return next();
  }

  const isAssigned = req.user.assignedParks.some(park => park.toString() === parkId.toString());

  if (!isAssigned) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this park'
    });
  }

  next();
};