const fs = require('fs')
const Document = require('../models/Document')
const { addExtractionJob } = require('../services/queueService')
const { summarizeText } = require('../services/summaryService')
const ApiError = require('../utils/apiError')
const asyncHandler = require('../utils/asyncHandler')

// POST /api/documents/upload
// saves the file and queues extraction in the background, returns 202 immediately
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400)
  }

  const document = await Document.create({
    user: req.user._id,
    filename: req.file.originalname,
    filepath: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    status: 'pending'
  })

  await addExtractionJob(document._id.toString(), req.file.path)

  res.status(202).json({
    success: true,
    message: 'File uploaded. Text extraction is in progress.',
    document: {
      _id: document._id,
      filename: document.filename,
      size: document.size,
      status: document.status,
      uploadedAt: document.createdAt
    }
  })
})

// GET /api/documents
// skipping extractedText in list view to keep the response small
const getAllDocuments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [documents, total] = await Promise.all([
    Document.find({ user: req.user._id }, { extractedText: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments({ user: req.user._id })
  ])

  res.json({
    success: true,
    count: documents.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    documents
  })
})

// GET /api/documents/:id
const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id
  })

  if (!document) {
    throw new ApiError('Document not found', 404)
  }

  res.json({ success: true, document })
})

// GET /api/documents/search?q=term
const searchDocuments = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q || q.trim().length === 0) {
    throw new ApiError('Search query is required', 400)
  }

  const documents = await Document.find(
    {
      user: req.user._id,
      $text: { $search: q }
    },
    {
      score: { $meta: 'textScore' },
      extractedText: 1,
      filename: 1,
      size: 1,
      status: 1,
      createdAt: 1
    }
  ).sort({ score: { $meta: 'textScore' } })

  const results = documents.map((doc) => {
    const snippet = getSnippet(doc.extractedText, q)
    return {
      _id: doc._id,
      filename: doc.filename,
      size: doc.size,
      status: doc.status,
      createdAt: doc.createdAt,
      snippet,
      score: doc._doc.score
    }
  })

  res.json({ success: true, query: q, count: results.length, results })
})

// POST /api/documents/:id/summarize
// caches the summary in mongo so we don't hit the AI api every time
const summarizeDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id
  })

  if (!document) throw new ApiError('Document not found', 404)
  if (document.status !== 'completed') {
    throw new ApiError('Document text extraction is not complete yet', 400)
  }
  if (!document.extractedText) {
    throw new ApiError('No text available to summarize', 400)
  }

  if (document.summary) {
    return res.json({ success: true, summary: document.summary, cached: true })
  }

  const summary = await summarizeText(document.extractedText)

  document.summary = summary
  await document.save()

  res.json({ success: true, summary, cached: false })
})

// DELETE /api/documents/:id
// removes from db and also deletes the actual file from disk
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id
  })

  if (!document) throw new ApiError('Document not found', 404)

  if (fs.existsSync(document.filepath)) {
    fs.unlinkSync(document.filepath)
  }

  await document.deleteOne()

  res.json({ success: true, message: 'Document deleted successfully' })
})

// pulls a short snippet of text around the first match for search previews
const getSnippet = (text, query) => {
  if (!text) return ''
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase().split(' ')[0]
  const index = lowerText.indexOf(lowerQuery)
  if (index === -1) return text.slice(0, 200) + '...'
  const start = Math.max(0, index - 80)
  const end = Math.min(text.length, index + 120)
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
}

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocument,
  searchDocuments,
  summarizeDocument,
  deleteDocument
}
