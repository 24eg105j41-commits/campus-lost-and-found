const express = require('express');
const {
  getMyMatches,
  getItemMatches,
  scanItemMatches,
  updateMatchStatus,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getMyMatches);
router.route('/item/:itemId').get(getItemMatches);
router.route('/scan/:itemId').post(protect, scanItemMatches);
router.route('/:id').put(protect, updateMatchStatus);

module.exports = router;
