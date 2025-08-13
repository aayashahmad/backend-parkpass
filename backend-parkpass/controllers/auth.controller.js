const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { createOTPEmail } = require('../templates/otpEmail');

// --- helpers ---
const signToken = (user) =>
  jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

const norm = (s) => String(s || '').toLowerCase().trim();

// ========== REGISTER (Private/SuperAdmin via middleware) ==========
exports.registerUser = [
  body('name').isLength({ min: 1 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { name, email, password, role, assignedParks = [] } = req.body;
      const emailLc = norm(email);

      const existingUser = await User.findOne({ email: emailLc });
      if (existingUser)
        return res.status(409).json({ success: false, message: 'User already exists' });

      let assignedParkIds = [];
      if (assignedParks.length) {
        const Park = require('../models/Park');
        const parks = await Park.find({ name: { $in: assignedParks } });
        assignedParkIds = parks.map((p) => p._id);
        if (assignedParkIds.length !== assignedParks.length) {
          return res
            .status(400)
            .json({ success: false, message: 'One or more assigned parks were not found.' });
        }
      }

      const user = await User.create({
        name,
        email: emailLc,
        password, // hashed by model pre-save
        role: role || 'ticket-checker',
        assignedParks: assignedParkIds,
      });

      res.status(201).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

// ========== LOGIN (Public) ==========
exports.login = async (req, res) => {
  try {
    const email = norm(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: 'Please provide an email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user);
    res.status(200).json({ success: true, token, data: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========== ME / UPDATE ==========
exports.getMe = async (req, res) => {
  try {
    // middleware should set req.userId from JWT "sub"
    const user = await User.findById(req.userId).populate('assignedParks');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = norm(req.body.email);

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+password');
    const ok = await user.matchPassword(String(req.body.currentPassword || ''));
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = String(req.body.newPassword || '');
    await user.save();

    const token = signToken(user);
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========== ADMIN USER MGMT ==========
exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find().populate('assignedParks');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('assignedParks');
    if (!user)
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, assignedParks = [] } = req.body;

    let assignedParkIds = [];
    if (assignedParks.length) {
      const Park = require('../models/Park');
      const parks = await Park.find({ name: { $in: assignedParks } });
      assignedParkIds = parks.map((p) => p._id);
      if (assignedParkIds.length !== assignedParks.length) {
        return res.status(400).json({ success: false, message: 'One or more assigned parks were not found.' });
      }
    }

    const updates = { name, role, assignedParks: assignedParkIds };
    if (email) updates.email = norm(email);

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
};

// ========== FORGOT / RESET PASSWORD WITH OTP (Public) ==========
// POST /api/auth/forgotpassword  { email }
exports.forgotPassword = async (req, res) => {
  try {
    const email = norm(req.body.email);
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, an OTP has been sent.',
        requiresOTP: false
      });
    }

    // Generate OTP
    const otp = user.generateResetPasswordOTP();
    await user.save({ validateBeforeSave: false });

    // Send beautiful OTP email
    await sendEmail({
      to: email,
      subject: '🔐 ParkPass Password Reset OTP - Secure & Beautiful',
      html: createOTPEmail(otp, user.name)
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
      requiresOTP: true,
      email: email // Send back email for next step
    });
  } catch (err) {
    // best-effort rollback
    try {
      const email = norm(req.body.email);
      await User.updateOne({ email }, {
        $unset: {
          resetPasswordOTP: 1,
          resetPasswordOTPExpire: 1
        }
      });
    } catch (_) {}
    console.error('forgotPassword error:', err);
    res.status(500).json({ success: false, message: 'OTP could not be sent' });
  }
};

// POST /api/auth/verify-otp  { email, otp }
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({
      email: norm(email),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: email
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/reset-password-with-otp  { email, otp, password, confirmPassword }
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({
      email: norm(email),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password and clear OTP fields
    user.password = String(password);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('resetPasswordWithOTP error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Legacy token-based reset (keeping for backward compatibility)
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ success: false, message: 'token, email, and password are required' });

    const hashed = crypto.createHash('sha256').update(String(token)).digest('hex');
    const user = await User.findOne({
      email: norm(email),
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+password');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = String(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/check-otp/:email - Check if OTP exists in database (for testing)
exports.checkOTP = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({
      email: norm(email)
    }).select('+resetPasswordOTP +resetPasswordOTPExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasOTP = user.resetPasswordOTP && user.resetPasswordOTPExpire;
    const isExpired = hasOTP && user.resetPasswordOTPExpire < new Date();

    res.json({
      success: true,
      message: '🔍 OTP Status Check',
      data: {
        email: email,
        hasOTP: !!hasOTP,
        isExpired: isExpired,
        otp: user.resetPasswordOTP || null,
        expiresAt: user.resetPasswordOTPExpire || null,
        timeRemaining: hasOTP && !isExpired ?
          Math.ceil((user.resetPasswordOTPExpire - new Date()) / 1000) + ' seconds' :
          null
      }
    });
  } catch (err) {
    console.error('checkOTP error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
