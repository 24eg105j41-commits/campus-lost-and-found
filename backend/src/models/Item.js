const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item reporter user ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Item type is required (lost or found)'],
      enum: ['lost', 'found'],
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'Documents',
        'Books',
        'Clothing',
        'Accessories',
        'Keys',
        'Bags',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '', // Stored as relative URL/path, e.g. /uploads/item-12345.jpg
    },
    status: {
      type: String,
      enum: ['Lost', 'Found', 'Potential Match', 'Matched', 'Claimed', 'Recovered', 'Closed'],
      default: function () {
        return this.type === 'found' ? 'Found' : 'Lost';
      },
    },
    recoveryDetails: {
      claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      claimReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim',
      },
      handoverLocation: String,
      recoveredAt: Date,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias for title for backwards compatibility
itemSchema.virtual('title').get(function () {
  return this.itemName;
});

// Virtual alias for reporter
itemSchema.virtual('reporter').get(function () {
  return this.user;
});

// Indexes for fast querying by type, category, and keyword search
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ user: 1 });
itemSchema.index({ itemName: 'text', description: 'text', location: 'text', color: 'text' });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
