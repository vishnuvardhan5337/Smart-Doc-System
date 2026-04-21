const mongoose = require('mongoose')

// status goes: pending -> processing -> completed (or failed)
const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    filepath: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      default: 'application/pdf'
    },
    extractedText: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    errorMessage: {
      type: String,
      default: ''
    },
    pageCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

// weighted so filename matches rank higher than body text matches
documentSchema.index(
  { extractedText: 'text', filename: 'text' },
  { weights: { filename: 10, extractedText: 1 } }
)

module.exports = mongoose.model('Document', documentSchema)
