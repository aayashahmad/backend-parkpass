const express = require('express');
const {
  getSalesData,
  getVisitorData,
  getParkPopularity,
  exportSalesReport
} = require('../controllers/analytics.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - Admin only
router.use(protect);
router.use(authorize('super-admin', 'park-admin'));

router.get('/sales', getSalesData);
router.get('/visitors', getVisitorData);
router.get('/popularity', getParkPopularity);
router.get('/export/sales', exportSalesReport);

module.exports = router;