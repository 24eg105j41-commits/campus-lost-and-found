const mongoose = require('mongoose');
const Item = require('./Item');

// FoundItem helper model / discriminator
const FoundItem =
  mongoose.models.FoundItem ||
  Item.discriminator(
    'FoundItem',
    new mongoose.Schema({}),
    'found' // maps to type: 'found'
  );

module.exports = FoundItem;
