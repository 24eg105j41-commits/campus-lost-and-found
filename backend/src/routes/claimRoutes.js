const express = require('express');
const {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.array('proofImages', 3), createClaim);
router.get('/my-claims', protect, getMyClaims);
router.get('/item/:itemId', protect, getItemClaims);
router.put('/:id/status', protect, updateClaimStatus);

module.exports = router;
