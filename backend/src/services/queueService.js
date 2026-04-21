const Bull = require('bull')

// using bull + redis so extraction runs in the background
// without this, uploading a big pdf would block the whole server
const extractionQueue = new Bull('pdf-extraction', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
})

const addExtractionJob = async (documentId, filepath) => {
  const job = await extractionQueue.add({ documentId, filepath })
  console.log(`queued extraction job ${job.id} for document ${documentId}`)
  return job
}

module.exports = { extractionQueue, addExtractionJob }
