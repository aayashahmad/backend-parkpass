const express = require('express');
const { sendContactEmail, getContactInfo } = require('../controllers/contact.controller');

const router = express.Router();

// @route   POST /api/contact
// @desc    Send contact form email
// @access  Public
router.post('/', sendContactEmail);

// @route   GET /api/contact/info
// @desc    Get contact information
// @access  Public
router.get('/info', getContactInfo);

module.exports = router;
