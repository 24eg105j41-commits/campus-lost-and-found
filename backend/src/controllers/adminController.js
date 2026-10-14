const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');

/**
 * @desc    Get dashboard analytics & statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
  try {
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const totalRecovered = await Item.countDocuments({ status: { $regex: /^recovered$/i } });
    const totalOpen = await Item.countDocuments({ status: { $in: ['Lost', 'Found', 'Potential Match', 'Claimed'] } });
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({
      status: { $in: ['submitted', 'under_review'] },
    });
    const totalUsers = await User.countDocuments();

    // Category distribution
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent items
    const recentItems = await Item.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalItems: totalLost + totalFound,
        totalLost,
        totalFound,
        totalRecovered,
        totalOpen,
        totalClaims,
        pendingClaims,
        totalUsers,
        recoveryRate: totalLost + totalFound > 0
          ? Math.round((totalRecovered / (totalLost + totalFound)) * 100)
          : 0,
      },
      categoryStats,
      recentItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all claims with item and claimant details (admin)
 * @route   GET /api/admin/claims
 * @access  Private/Admin
 */
const getAllClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find()
      .populate('item')
      .populate('claimant', 'name email phone department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, claims });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user and associated items (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && req.user.id === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account',
      });
    }

    await User.findByIdAndDelete(req.params.id);
    await Item.deleteMany({ user: req.params.id });
    await Claim.deleteMany({ claimant: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllClaims,
  deleteUser,
};
