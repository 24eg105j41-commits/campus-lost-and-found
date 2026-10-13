const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a claim for a found item
 * @route   POST /api/claims
 * @access  Private
 */
const createClaim = async (req, res, next) => {
  try {
    const { itemId, proofDescription } = req.body;

    if (!itemId || !proofDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId and proofDescription',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const itemOwnerId = (item.user?._id || item.user || '').toString();
    if (itemOwnerId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim an item you reported yourself',
      });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user.id,
      status: { $in: ['submitted', 'under_review', 'approved'] },
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active claim for this item',
      });
    }

    // Process proof images if any
    const proofImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        proofImages.push({
          url: `/uploads/${file.filename}`,
        });
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user.id,
      proofDescription,
      proofImages,
      status: 'submitted',
    });

    // We don't change item status to claim_pending because it's not a required status.
    // The claim exists and is linked.

    // Create notification for item reporter
    const reporterId = item.user?._id || item.user;
    await Notification.create({
      recipient: reporterId,
      title: 'New Claim Received',
      message: `${req.user.name} submitted an ownership claim for your reported item: "${item.itemName || item.title}".`,
      type: 'claim_update',
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. The finder or campus admin will review your details.',
      claim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all claims submitted by current user
 * @route   GET /api/claims/my-claims
 * @access  Private
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user.id })
      .populate('item')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get claims for a specific item (for item reporter or admin)
 * @route   GET /api/claims/item/:itemId
 * @access  Private
 */
const getItemClaims = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const itemOwnerId = (item.user?._id || item.user || '').toString();
    if (itemOwnerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view claims for this item',
      });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email phone department campusId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update claim status (approve/reject/complete recovery)
 * @route   PUT /api/claims/:id/status
 * @access  Private
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, reviewerNotes, handoverLocation } = req.body;

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const item = await Item.findById(claim.item._id);

    // Only reporter or admin can resolve claim
    const itemOwnerId = (item.user?._id || item.user || '').toString();
    if (itemOwnerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this claim',
      });
    }

    claim.status = status;
    claim.reviewerNotes = reviewerNotes || claim.reviewerNotes;
    claim.reviewedBy = req.user.id;

    if (['approved', 'completed', 'rejected'].includes(status)) {
      claim.resolvedAt = new Date();
    }

    await claim.save();

    // Update item status accordingly
    if (status === 'approved') {
      item.status = 'Claimed';
      item.recoveryDetails = {
        claimedBy: claim.claimant,
        claimReference: claim._id,
        handoverLocation: handoverLocation || 'Campus Lost & Found Desk',
      };
      await item.save();
    } else if (status === 'completed') {
      item.status = 'Recovered';
      item.recoveryDetails.recoveredAt = new Date();
      await item.save();
    } else if (status === 'rejected') {
      // Check if there are other pending claims
      const remainingClaims = await Claim.countDocuments({
        item: item._id,
        status: { $in: ['submitted', 'under_review'] },
      });
      if (remainingClaims === 0) {
        item.status = item.type === 'found' ? 'Found' : 'Lost';
        await item.save();
      }
    }

    // Notify claimant
    await Notification.create({
      recipient: claim.claimant,
      title: `Claim ${status.toUpperCase()}`,
      message: `Your claim for "${item.title}" was updated to: ${status}.`,
      type: 'claim_update',
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
};
