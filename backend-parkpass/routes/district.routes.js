const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict
} = require('../controllers/district.controller');

const { protect, authorize } = require('../middleware/auth');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `district-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Include park routes
const parkRouter = require('./park.routes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:districtId/parks', parkRouter);

// Public routes
router.get('/', getDistricts);
router.get('/:id', getDistrict);

// Protected routes - Super admin only
router.use(protect);
router.use(authorize('super-admin'));

router.post('/', upload.single('image'), createDistrict);
router.put('/:id', upload.single('image'), updateDistrict);
router.delete('/:id', deleteDistrict);

module.exports = router;