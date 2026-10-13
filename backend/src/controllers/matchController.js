const Match = require('../models/Match');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const aiService = require('../services/aiService');

/**
 * @desc    Find and create matches for an item
 */
const generateMatchesForItem = async (targetItem) => {
  try {
    const candidateItems = await Item.find({
      type: targetItem.type === 'lost' ? 'found' : 'lost',
      status: { $in: ['Lost', 'Found', 'Potential Match'] },
      _id: { $ne: targetItem._id },
    }).populate('user', 'name email role department');

    const matches = await aiService.findPotentialMatches(targetItem, candidateItems);

    for (const matchResult of matches) {
      const lostId = targetItem.type === 'lost' ? targetItem._id : matchResult.item._id;
      const foundId = targetItem.type === 'found' ? targetItem._id : matchResult.item._id;

      const matchDoc = {
        lostItemId: lostId,
        foundItemId: foundId,
        confidenceScore: matchResult.score,
        matchingFactors: matchResult.matchingFactors || [],
        missingFactors: matchResult.missingFactors || [],
        conflictingFactors: matchResult.conflictingFactors || [],
        scoreBreakdown: matchResult.scoreBreakdown || {},
        status: 'Pending',
      };

      // Check if match already exists
      let match = await Match.findOne({
        lostItemId: matchDoc.lostItemId,
        foundItemId: matchDoc.foundItemId,
      });

      if (!match) {
        match = await Match.create(matchDoc);

        const foundItemFull = await Item.findById(matchDoc.foundItemId).populate('user');
        const lostItemFull = await Item.findById(matchDoc.lostItemId).populate('user');

        const reasonsText = matchDoc.matchingFactors.slice(0, 2).join('; ') || 'Similar attributes detected';

        // Notify lost item reporter
        if (lostItemFull?.user) {
          const lostUserId = lostItemFull.user._id || lostItemFull.user;
          const existingLostNotif = await Notification.findOne({
            recipient: lostUserId,
            relatedMatch: match._id,
          });

          if (!existingLostNotif) {
            await Notification.create({
              recipient: lostUserId,
              title: `Potential Match: ${matchDoc.confidenceScore}/100`,
              message: `A found item ("${foundItemFull?.itemName || 'Item'}") matches your lost report ("${lostItemFull.itemName}"). Factors: ${reasonsText}.`,
              type: 'match_found',
              relatedItem: lostItemFull._id,
              relatedMatch: match._id,
            });
          }
        }

        // Notify found item reporter
        if (foundItemFull?.user) {
          const foundUserId = foundItemFull.user._id || foundItemFull.user;
          const existingFoundNotif = await Notification.findOne({
            recipient: foundUserId,
            relatedMatch: match._id,
          });

          if (!existingFoundNotif) {
            await Notification.create({
              recipient: foundUserId,
              title: `Potential Match: ${matchDoc.confidenceScore}/100`,
              message: `Your found item report ("${foundItemFull.itemName}") might belong to a student looking for "${lostItemFull?.itemName || 'their item'}".`,
              type: 'match_found',
              relatedItem: foundItemFull._id,
              relatedMatch: match._id,
            });
          }
        }
      } else {
        match.confidenceScore = matchDoc.confidenceScore;
        match.matchingFactors = matchDoc.matchingFactors;
        match.missingFactors = matchDoc.missingFactors;
        match.conflictingFactors = matchDoc.conflictingFactors;
        match.scoreBreakdown = matchDoc.scoreBreakdown;
        await match.save();
      }
    }
  } catch (error) {
    console.error('Error generating matches:', error);
  }
};

/**
 * @desc    Get matches for the authenticated user
 * @route   GET /api/matches
 * @access  Private
 */
const getMyMatches = async (req, res, next) => {
  try {
    const myItems = await Item.find({ user: req.user.id }).select('_id');
    const myItemIds = myItems.map((i) => i._id);

    const matches = await Match.find({
      $or: [{ lostItemId: { $in: myItemIds } }, { foundItemId: { $in: myItemIds } }],
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'user', select: 'name email role department phone' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'user', select: 'name email role department phone' },
      })
      .sort({ confidenceScore: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get potential matches for a specific item
 * @route   GET /api/matches/item/:itemId
 * @access  Public
 */
const getItemMatches = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const matches = await Match.find({
      $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'user', select: 'name email role department' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'user', select: 'name email role department' },
      })
      .sort({ confidenceScore: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    On-demand AI match scan for a specific item
 * @route   POST /api/matches/scan/:itemId
 * @access  Private
 */
const scanItemMatches = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await generateMatchesForItem(item);

    const updatedMatches = await Match.find({
      $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'user', select: 'name email role department' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'user', select: 'name email role department' },
      })
      .sort({ confidenceScore: -1 });

    res.status(200).json({
      success: true,
      message: `AI scan completed. Found ${updatedMatches.length} potential match(es).`,
      count: updatedMatches.length,
      matches: updatedMatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update match status (Confirm or Reject)
 * @route   PUT /api/matches/:id
 * @access  Private
 */
const updateMatchStatus = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid match status' });
    }

    match.status = status;
    await match.save();

    res.status(200).json({
      success: true,
      message: `Match status updated to ${status}`,
      match,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateMatchesForItem,
  getMyMatches,
  getItemMatches,
  scanItemMatches,
  updateMatchStatus,
};
