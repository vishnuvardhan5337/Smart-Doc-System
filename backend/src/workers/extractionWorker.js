require('dotenv').config()
const mongoose = require('mongoose')
const { extractionQueue } = require('../services/queueService')
const { extractTextFromPDF } = require('../services/pdfService')
const Document = require('../models/Document')

// separate process from the main server so heavy pdf work doesn't block requests
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('extraction worker connected to mongodb')
}).catch((err) => {
  console.error('worker db connection failed:', err)
  process.exit(1)
})

extractionQueue.process(1, async (job) => {
  const { documentId, filepath } = job.data
  console.log(`processing job ${job.id} for document ${documentId}`)

  await Document.findByIdAndUpdate(documentId, { status: 'processing' })

  const { text, pageCount } = await extractTextFromPDF(filepath)

  await Document.findByIdAndUpdate(documentId, {
    extractedText: text,
    pageCount,
    status: 'completed'
  })

  console.log(`job ${job.id} done - extracted ${text.length} chars`)
  return { success: true, chars: text.length }
})

extractionQueue.on('failed', async (job, err) => {
  console.error(`job ${job.id} failed:`, err.message)
  await Document.findByIdAndUpdate(job.data.documentId, {
    status: 'failed',
    errorMessage: err.message
  })
})

extractionQueue.on('completed', (job) => {
  console.log(`job ${job.id} completed`)
})

console.log('extraction worker running...')
