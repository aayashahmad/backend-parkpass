const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['super-admin', 'park-admin', 'ticket-checker'],
      default: 'ticket-checker',
    },
    assignedParks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Park' }],

    resetPasswordToken: { type: String, index: true, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // OTP fields for password reset
    resetPasswordOTP: { type: String, select: false },
    resetPasswordOTPExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash password only when changed
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// Generate OTP for password reset
UserSchema.methods.generateResetPasswordOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// hide sensitive fields
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.resetPasswordOTP;
  delete obj.resetPasswordOTPExpire;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
