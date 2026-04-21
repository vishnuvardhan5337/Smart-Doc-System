const pdfParse = require('pdf-parse')
const fs = require('fs')
const ApiError = require('../utils/apiError')

const extractTextFromPDF = async (filepath) => {
  if (!fs.existsSync(filepath)) {
    throw new ApiError(`File not found: ${filepath}`, 404)
  }

  let fileBuffer
  try {
    fileBuffer = fs.readFileSync(filepath)
  } catch (err) {
    throw new ApiError(`Failed to read file: ${err.message}`, 500)
  }

  try {
    const data = await pdfParse(fileBuffer)

    // clean up extra whitespace from the extracted text
    const cleanedText = data.text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()

    return {
      text: cleanedText,
      pageCount: data.numpages
    }
  } catch (err) {
    throw new ApiError(
      `PDF parsing failed - file may be corrupted or password protected: ${err.message}`,
      422
    )
  }
}

module.exports = { extractTextFromPDF }
