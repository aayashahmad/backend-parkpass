const express = require('express');
const {
  registerUser,
  login,
  forgotPassword,
  verifyOTP,
  resetPasswordWithOTP,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  checkOTP
} = require('../controllers/auth.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/signup', registerUser); // Public signup route
router.post('/forgotpassword', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-with-otp', resetPasswordWithOTP);
router.put('/resetpassword/:resettoken', resetPassword); // Legacy route
router.get('/check-otp/:email', checkOTP); // Check OTP in database

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

// Super admin only routes
router.use(authorize('super-admin'));

router.route('/users')
  .get(getUsers)
  .post(registerUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;