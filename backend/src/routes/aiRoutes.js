const express = require('express');
const {
  smartSearch,
  generateDescription,
  analyzeImage,
  handleChatbot,
} = require('../controllers/aiController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/search', smartSearch);
router.post('/generate-description', generateDescription);
router.post('/analyze-image', upload.single('image'), analyzeImage);
router.post('/chatbot', handleChatbot);

module.exports = router;
