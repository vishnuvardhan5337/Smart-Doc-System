import { useNavigate } from 'react-router-dom'
import { documentsAPI } from '../services/api'

/**
 * Status badge colors for document processing states
 */
const STATUS_STYLES = {
  pending:    { background: '#fff3cd', color: '#856404' },
  processing: { background: '#cfe2ff', color: '#084298' },
  completed:  { background: '#d1e7dd', color: '#0a3622' },
  failed:     { background: '#f8d7da', color: '#842029' }
}

/**
 * DocumentList Component
 *
 * Renders a list of document cards with filename, metadata, status badge.
 * Clicking a card navigates to the document detail page.
 *
 * When in search mode, shows a snippet with the matched term highlighted.
 */
const DocumentList = ({ documents, onDelete, searchQuery }) => {
  const navigate = useNavigate()

  const handleDelete = async (e, id) => {
    e.stopPropagation() // Prevent card click navigation
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    try {
      await documentsAPI.delete(id)
      onDelete()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (documents.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No documents found.</p>
        <p style={{ fontSize: '14px', opacity: 0.6 }}>
          {searchQuery ? `No results for "${searchQuery}"` : 'Upload a PDF to get started!'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {documents.map((doc) => (
        <div
          key={doc._id}
          style={styles.card}
          onClick={() => doc.status === 'completed' && navigate(`/document/${doc._id}`)}
        >
          <div style={styles.left}>
            <div style={styles.filename}>📄 {doc.filename}</div>
            <div style={styles.meta}>
              {formatSize(doc.size)} •{' '}
              {new Date(doc.createdAt).toLocaleDateString()}
              {doc.pageCount > 0 && ` • ${doc.pageCount} pages`}
            </div>

            {/* Search snippet with highlighted term */}
            {doc.snippet && (
              <div
                style={styles.snippet}
                dangerouslySetInnerHTML={{ __html: highlightTerm(doc.snippet, searchQuery) }}
              />
            )}

            {doc.status === 'failed' && (
              <div style={styles.errorMsg}>⚠️ Extraction failed: {doc.errorMessage}</div>
            )}
          </div>

          <div style={styles.right}>
            <span style={{ ...styles.badge, ...STATUS_STYLES[doc.status] }}>
              {doc.status}
            </span>
            <button
              onClick={(e) => handleDelete(e, doc._id)}
              style={styles.deleteBtn}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Wraps matched search terms in a highlight span */
const highlightTerm = (text, query) => {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark style="background:#fff176;padding:0 2px">$1</mark>'
  )
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const styles = {
  card: { background: 'white', border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', transition: 'box-shadow 0.2s', gap: '16px' },
  left: { flex: 1 },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 },
  filename: { fontWeight: '600', fontSize: '15px', marginBottom: '4px' },
  meta: { fontSize: '13px', color: '#6c757d' },
  snippet: { marginTop: '8px', fontSize: '13px', color: '#495057', lineHeight: '1.5', background: '#f8f9fa', padding: '8px', borderRadius: '4px' },
  errorMsg: { marginTop: '8px', fontSize: '13px', color: '#dc3545' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  deleteBtn: { padding: '5px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#6c757d' }
}

export default DocumentList
