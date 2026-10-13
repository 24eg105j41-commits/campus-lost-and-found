const Item = require('../models/Item');
const aiService = require('../services/aiService');

/**
 * @desc    Natural Language Smart Search
 * @route   POST /api/ai/search
 * @access  Public
 */
const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    const parsed = aiService.parseNaturalLanguageSearch(query);

    // Build database query based on parsed intent
    const dbFilter = {};
    if (parsed.type) {
      dbFilter.type = parsed.type;
    }
    if (parsed.category) {
      dbFilter.category = parsed.category;
    }

    // Time window constraint if extracted
    if (parsed.dateRange) {
      const now = new Date();
      if (parsed.dateRange === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        dbFilter.date = { $gte: startOfDay };
      } else if (parsed.dateRange === 'yesterday') {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        yesterday.setHours(0, 0, 0, 0);
        dbFilter.date = { $gte: yesterday };
      } else if (parsed.dateRange === 'this_week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        dbFilter.date = { $gte: weekAgo };
      }
    }

    // Fetch matching candidates from MongoDB
    const candidateItems = await Item.find(dbFilter)
      .populate('user', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(50);

    // Score and rank candidates against the natural query
    const scoredResults = candidateItems.map((item) => {
      let score = 0;
      const reasons = [];

      // Keyword match
      if (parsed.keywords) {
        const itemText = `${item.itemName} ${item.description}`;
        const kwWords = parsed.keywords.split(' ').filter(Boolean);
        const matchedKw = kwWords.filter((w) =>
          itemText.toLowerCase().includes(w.toLowerCase())
        );
        if (matchedKw.length > 0) {
          score += Math.min(40, matchedKw.length * 15);
          reasons.push(`Matched keywords: ${matchedKw.join(', ')}`);
        }
      }

      // Color match
      if (parsed.color && item.color) {
        if (item.color.toLowerCase().includes(parsed.color.toLowerCase())) {
          score += 25;
          reasons.push(`Matched color: ${parsed.color}`);
        }
      }

      // Location match
      if (parsed.location && item.location) {
        if (item.location.toLowerCase().includes(parsed.location.toLowerCase())) {
          score += 25;
          reasons.push(`Matched location: ${parsed.location}`);
        }
      }

      // Category match
      if (parsed.category && item.category === parsed.category) {
        score += 20;
        reasons.push(`Matched category: ${parsed.category}`);
      }

      return {
        item,
        relevanceScore: Math.min(100, score),
        reasons,
      };
    });

    // If query was specific, sort by relevance; otherwise return newest
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const items = scoredResults.map((r) => ({
      ...r.item.toObject(),
      relevanceScore: r.relevanceScore,
      matchReasons: r.reasons,
    }));

    res.status(200).json({
      success: true,
      parsedQuery: parsed,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Description Enhancer & Attribute Suggester
 * @route   POST /api/ai/generate-description
 * @access  Public
 */
const generateDescription = async (req, res, next) => {
  try {
    const { itemName, category, rawDescription, color, location, date } = req.body;

    const result = aiService.generateEnhancedDescription({
      itemName,
      category,
      rawDescription,
      color,
      location,
      date,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Image Recognition & Verification
 * @route   POST /api/ai/analyze-image
 * @access  Public
 */
const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to analyze',
      });
    }

    const analysis = await aiService.analyzeImage(req.file);

    res.status(200).json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Campus Chatbot Assistant
 * @route   POST /api/ai/chatbot
 * @access  Public
 */
const handleChatbot = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    // Fetch active items so the chatbot searches real campus records
    const allItems = await Item.find({
      status: { $in: ['Lost', 'Found', 'Potential Match'] },
    })
      .select('itemName category description location date color image type status')
      .sort({ createdAt: -1 })
      .limit(100);

    const response = await aiService.processChatbotMessage({
      message,
      history,
      allItems,
    });

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  smartSearch,
  generateDescription,
  analyzeImage,
  handleChatbot,
};
