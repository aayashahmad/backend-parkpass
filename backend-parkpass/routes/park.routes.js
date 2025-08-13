const express = require('express');
const {
  getParks,
  getPark,
  createPark,
  updatePark,
  deletePark,
  getParksByDistrict
} = require('../controllers/park.controller');

const { protect, authorize, checkParkAssignment } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', (req, res) => {
  // If called from district route, use getParksByDistrict
  if (req.params.districtId) {
    return getParksByDistrict(req, res);
  }
  // Otherwise use regular getParks
  return getParks(req, res);
});
router.get('/:id', getPark);

// Protected routes
router.use(protect);

// Park admin and super admin only routes
router.use(authorize('park-admin', 'super-admin'));

router.post('/', createPark);

// Check if user is assigned to park
router.use('/:id', checkParkAssignment);

router.route('/:id')
  .put(updatePark)
  .delete(deletePark);

module.exports = router;