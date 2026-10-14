const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

const ALLOWED_CATEGORIES = [
  'Electronics',
  'Documents',
  'Books',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Other',
];

/**
 * @desc    Create a new lost or found item report
 * @route   POST /api/items
 * @access  Private (Authenticated users only)
 */
const createItem = async (req, res, next) => {
  try {
    const {
      type,
      itemName,
      title, // Fallback alias
      category,
      description,
      location,
      date,
      color,
      status,
    } = req.body;

    const finalItemName = (itemName || title || '').trim();

    // Field validation
    if (!type || !['lost', 'found'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please specify whether this item is "lost" or "found"',
      });
    }

    if (!finalItemName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the item name',
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Please select a valid category from: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of the item',
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: `Please specify the campus location where the item was ${type === 'lost' ? 'lost' : 'found'}`,
      });
    }

    const finalColor = (color && color.trim()) || 'Unspecified';

    // Handle image upload from Multer
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const initialStatus =
      status && ['Lost', 'Found', 'Matched', 'Claimed', 'Recovered'].includes(status)
        ? status
        : type.toLowerCase() === 'found'
        ? 'Found'
        : 'Lost';

    const item = await Item.create({
      user: req.user.id,
      type: type.toLowerCase(),
      itemName: finalItemName,
      category,
      description: description.trim(),
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      color: finalColor,
      image: imagePath,
      status: initialStatus,
    });

    const populatedItem = await Item.findById(item._id).populate(
      'user',
      'name email role department phone'
    );
    
    const { generateMatchesForItem } = require('./matchController');
    generateMatchesForItem(item);

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} item report created successfully`,
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items with optional filters
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const { type, category, color, status, search, limit = 50, page = 1 } = req.query;

    const query = {};

    if (type) query.type = type.toLowerCase();
    if (category && category !== 'All') query.category = category;
    if (color) query.color = new RegExp(color, 'i');
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('user', 'name email role department phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Lost Items
 * @route   GET /api/items/lost
 * @access  Public
 */
const getLostItems = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { type: 'lost' };

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .populate('user', 'name email role department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Found Items
 * @route   GET /api/items/found
 * @access  Public
 */
const getFoundItems = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { type: 'found' };

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .populate('user', 'name email role department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'user',
      'name email role department phone'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items reported by the currently authenticated user
 * @route   GET /api/items/my-reports
 * @access  Private
 */
const getMyReports = async (req, res, next) => {
  try {
    const items = await Item.find({ user: req.user.id })
      .populate('user', 'name email role department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an item report (Strict Security: Only author or admin)
 * @route   PUT /api/items/:id
 * @access  Private
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    const itemUserId = (item.user?._id || item.user || '').toString();
    if (itemUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit reports that you created.',
      });
    }

    const { itemName, title, category, description, location, date, color, status } = req.body;

    if (itemName || title) item.itemName = (itemName || title).trim();
    if (category && ALLOWED_CATEGORIES.includes(category)) item.category = category;
    if (description) item.description = description.trim();
    if (location) item.location = location.trim();
    if (date) item.date = new Date(date);
    if (color) item.color = color.trim();
    if (status && ['Lost', 'Found', 'Matched', 'Claimed', 'Recovered'].includes(status)) {
      item.status = status;
    }

    // If new image uploaded
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    await item.save();

    const updated = await Item.findById(item._id).populate(
      'user',
      'name email role department phone'
    );

    const { generateMatchesForItem } = require('./matchController');
    generateMatchesForItem(updated);

    res.status(200).json({
      success: true,
      message: 'Item report updated successfully',
      item: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an item report (Strict Security: Only author or admin)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    const itemUserId = (item.user?._id || item.user || '').toString();
    if (itemUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete reports that you created.',
      });
    }

    await item.deleteOne();

    // Cascading cleanup of linked claims, matches, and notifications
    await Promise.allSettled([
      Claim.deleteMany({ item: item._id }),
      Match.deleteMany({ $or: [{ lostItemId: item._id }, { foundItemId: item._id }] }),
      Notification.deleteMany({ relatedItem: item._id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Item report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getLostItems,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem,
};
