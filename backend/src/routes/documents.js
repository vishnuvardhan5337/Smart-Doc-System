const express = require('express')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  uploadDocument,
  getAllDocuments,
  getDocument,
  searchDocuments,
  summarizeDocument,
  deleteDocument
} = require('../controllers/documentController')

const router = express.Router()

// All document routes require authentication
router.use(protect)

// NOTE: /search must be defined BEFORE /:id
// Otherwise Express would treat "search" as an ID value
router.get('/search', searchDocuments)

router.post('/upload', upload.single('file'), uploadDocument)
router.get('/', getAllDocuments)
router.get('/:id', getDocument)
router.post('/:id/summarize', summarizeDocument)
router.delete('/:id', deleteDocument)

module.exports = router
