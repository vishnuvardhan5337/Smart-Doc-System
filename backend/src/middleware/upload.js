const multer = require('multer')
const path = require('path')
const ApiError = require('../utils/apiError')

/**
 * Multer Storage Configuration
 *
 * Files are saved to the /uploads directory with a timestamp prefix
 * to prevent filename collisions when multiple users upload files
 * with the same name.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove spaces and special chars, add timestamp
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${Date.now()}-${sanitized}`)
  }
})

/**
 * File Filter
 * Rejects any file that is not a PDF before it is saved to disk.
 * This is the first line of defense against invalid uploads.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new ApiError('Only PDF files are allowed', 400), false)
  }
}

/**
 * Multer instance with:
 * - disk storage (saves to /uploads)
 * - PDF-only file filter
 * - 10MB file size limit
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

module.exports = upload
