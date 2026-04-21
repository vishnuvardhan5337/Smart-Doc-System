import { useState } from 'react'
import { documentsAPI } from '../services/api'

/**
 * UploadForm Component
 *
 * Handles PDF file selection and upload.
 * Shows a real-time upload progress bar.
 * Calls onUploadSuccess after successful upload so parent can refresh the list.
 */
const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && !selected.name.endsWith('.pdf')) {
      setMessage({ text: 'Only PDF files are allowed', type: 'error' })
      return
    }
    setFile(selected)
    setMessage({ text: '', type: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setMessage({ text: 'Please select a PDF file', type: 'error' })

    setUploading(true)
    setProgress(0)

    try {
      await documentsAPI.upload(file, setProgress)
      setMessage({ text: 'Uploaded! Text extraction is processing in the background.', type: 'success' })
      setFile(null)
      e.target.reset()
      onUploadSuccess()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Upload failed', type: 'error' })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload PDF</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={styles.fileInput}
          disabled={uploading}
        />
        <button type="submit" disabled={uploading || !file} style={styles.uploadBtn}>
          {uploading ? `Uploading ${progress}%` : 'Upload'}
        </button>
      </form>

      {uploading && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      )}

      {message.text && (
        <p style={{ ...styles.message, color: message.type === 'error' ? '#dc3545' : '#28a745' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}

const styles = {
  container: { background: '#f8f9fa', border: '2px dashed #dee2e6', borderRadius: '8px', padding: '24px', marginBottom: '24px' },
  title: { margin: '0 0 16px 0', fontSize: '18px' },
  form: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  fileInput: { flex: 1, padding: '8px', fontSize: '14px' },
  uploadBtn: { padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', minWidth: '120px' },
  progressBar: { height: '6px', background: '#dee2e6', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#007bff', transition: 'width 0.3s ease' },
  message: { margin: '12px 0 0 0', fontSize: '14px' }
}

export default UploadForm
