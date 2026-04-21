import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { documentsAPI } from '../services/api'

const DocumentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsAPI.getOne(id)
        setDocument(res.data.document)
        if (res.data.document.summary) {
          setSummary(res.data.document.summary)
        }
      } catch (err) {
        console.error('Failed to load document:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummaryError('')
    try {
      const res = await documentsAPI.summarize(id)
      setSummary(res.data.summary)
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'Summarization failed')
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) return <div style={styles.center}>Loading document...</div>
  if (!document) return <div style={styles.center}>Document not found.</div>

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{document.filename}</h1>
          <p style={styles.meta}>
            {formatSize(document.size)} •{' '}
            {new Date(document.createdAt).toLocaleDateString()}
            {document.pageCount > 0 && ` • ${document.pageCount} pages`}
          </p>
        </div>
        <span style={{ ...styles.badge, ...STATUS_STYLES[document.status] }}>
          {document.status}
        </span>
      </div>

      {/* AI Summarization Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>✨ AI Summary</h3>
          {!summary && (
            <button
              onClick={handleSummarize}
              disabled={summarizing || document.status !== 'completed'}
              style={styles.summarizeBtn}
            >
              {summarizing ? 'Generating...' : 'Generate Summary'}
            </button>
          )}
        </div>

        {summaryError && <p style={styles.error}>{summaryError}</p>}

        {summary ? (
          <p style={styles.summaryText}>{summary}</p>
        ) : (
          <p style={styles.placeholder}>
            {document.status !== 'completed'
              ? 'Summary available once text extraction completes.'
              : 'Click "Generate Summary" to create an AI summary of this document.'}
          </p>
        )}
      </div>

      {/* Extracted Text Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📝 Extracted Text</h3>
        {document.status === 'completed' && document.extractedText ? (
          <pre style={styles.extractedText}>{document.extractedText}</pre>
        ) : document.status === 'failed' ? (
          <p style={styles.error}>⚠️ Extraction failed: {document.errorMessage}</p>
        ) : (
          <p style={styles.placeholder}>
            Text extraction is {document.status}...
          </p>
        )}
      </div>
    </div>
  )
}

const STATUS_STYLES = {
  pending:    { background: '#fff3cd', color: '#856404' },
  processing: { background: '#cfe2ff', color: '#084298' },
  completed:  { background: '#d1e7dd', color: '#0a3622' },
  failed:     { background: '#f8d7da', color: '#842029' }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const styles = {
  container: { maxWidth: '860px', margin: '0 auto', padding: '30px 20px' },
  center: { textAlign: 'center', padding: '80px', color: '#6c757d' },
  backBtn: { padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: '0 0 6px 0', fontSize: '22px' },
  meta: { margin: 0, color: '#6c757d', fontSize: '14px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', flexShrink: 0 },
  section: { background: '#f8f9fa', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  sectionTitle: { margin: 0, fontSize: '16px' },
  summarizeBtn: { padding: '8px 18px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  summaryText: { margin: 0, lineHeight: '1.7', color: '#212529' },
  extractedText: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.6', margin: 0, fontSize: '14px', maxHeight: '500px', overflowY: 'auto' },
  placeholder: { margin: 0, color: '#6c757d', fontStyle: 'italic' },
  error: { color: '#dc3545', margin: 0 }
}

export default DocumentPage
