import { useState, useEffect, useCallback } from 'react'
import UploadForm from '../components/UploadForm'
import SearchBar from '../components/SearchBar'
import DocumentList from '../components/DocumentList'
import { documentsAPI } from '../services/api'

/**
 * HomePage
 *
 * Main application page. Shows upload form, search bar, and document list.
 *
 * State management:
 * - documents: current list shown (all or search results)
 * - isSearching: controls whether we show "all docs" or search results
 * - searchQuery: stored so DocumentList can highlight matched terms
 */
const HomePage = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const loadDocuments = useCallback(async (page = 1) => {
    setLoading(true)
    setIsSearching(false)
    setSearchQuery('')
    try {
      const res = await documentsAPI.getAll(page)
      setDocuments(res.data.documents)
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total
      })
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Auto-refresh pending/processing documents every 3 seconds
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.status === 'pending' || d.status === 'processing'
    )
    if (!hasPending || isSearching) return

    const interval = setInterval(() => loadDocuments(pagination.page), 3000)
    return () => clearInterval(interval)
  }, [documents, isSearching, loadDocuments, pagination.page])

  const handleSearchResults = (results, query) => {
    setDocuments(results)
    setIsSearching(true)
    setSearchQuery(query)
  }

  return (
    <div style={styles.container}>
      <UploadForm onUploadSuccess={() => loadDocuments(1)} />
      <SearchBar onResults={handleSearchResults} onClear={() => loadDocuments(1)} />

      <div style={styles.listHeader}>
        <h3 style={styles.listTitle}>
          {isSearching
            ? `Search results for "${searchQuery}" (${documents.length})`
            : `Your Documents (${pagination.total})`}
        </h3>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading documents...</div>
      ) : (
        <>
          <DocumentList
            documents={documents}
            onDelete={() => loadDocuments(pagination.page)}
            searchQuery={isSearching ? searchQuery : ''}
          />

          {/* Pagination controls — only shown when not searching */}
          {!isSearching && pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() => loadDocuments(pagination.page - 1)}
                style={styles.pageBtn}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => loadDocuments(pagination.page + 1)}
                style={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: '860px', margin: '0 auto', padding: '30px 20px' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  listTitle: { margin: 0, fontSize: '16px', color: '#495057' },
  loading: { textAlign: 'center', padding: '40px', color: '#6c757d' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  pageBtn: { padding: '8px 16px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', color: '#6c757d' }
}

export default HomePage
