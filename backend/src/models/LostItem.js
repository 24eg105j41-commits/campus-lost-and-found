const mongoose = require('mongoose');
const Item = require('./Item');

// LostItem helper model / discriminator
const LostItem =
  mongoose.models.LostItem ||
  Item.discriminator(
    'LostItem',
    new mongoose.Schema({}),
    'lost' // maps to type: 'lost'
  );

module.exports = LostItem;
