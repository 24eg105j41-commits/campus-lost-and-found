const express = require('express');
const {
  createItem,
  getItems,
  getLostItems,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Specific routes first to avoid route parameter collision with :id
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.get('/my-reports', protect, getMyReports);
router.get('/my-items', protect, getMyReports);

// General collection routes
router.get('/', getItems);
router.post('/', protect, upload.single('image'), createItem);

// Individual item routes
router.get('/:id', getItemById);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
