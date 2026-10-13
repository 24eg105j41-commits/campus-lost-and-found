const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @desc    API and Database Health Check
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1 || dbState === 2;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Campus Lost & Found Backend API',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
    features: {
      auth: 'JWT enabled',
      upload: 'Multer enabled',
      aiServiceReady: true,
    },
  });
});

module.exports = router;
