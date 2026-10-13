const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchingFactors: {
      type: [String],
      default: [],
    },
    missingFactors: {
      type: [String],
      default: [],
    },
    conflictingFactors: {
      type: [String],
      default: [],
    },
    scoreBreakdown: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
