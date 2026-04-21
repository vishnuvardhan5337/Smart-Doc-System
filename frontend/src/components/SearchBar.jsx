import { useState } from 'react'
import { documentsAPI } from '../services/api'

/**
 * SearchBar Component
 *
 * Sends search queries to the backend's full-text search endpoint.
 * Passes results up to the parent via onResults callback.
 * onClear resets the view back to the full document list.
 */
const SearchBar = ({ onResults, onClear }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await documentsAPI.search(query)
      onResults(res.data.results, query)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <form onSubmit={handleSearch} style={styles.form}>
      <input
        type="text"
        placeholder="Search inside documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />
      <button type="submit" disabled={loading} style={styles.searchBtn}>
        {loading ? 'Searching...' : '🔍 Search'}
      </button>
      {query && (
        <button type="button" onClick={handleClear} style={styles.clearBtn}>
          Clear
        </button>
      )}
    </form>
  )
}

const styles = {
  form: { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  input: { flex: 1, padding: '10px 14px', fontSize: '15px', border: '1px solid #dee2e6', borderRadius: '6px', minWidth: '200px' },
  searchBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  clearBtn: { padding: '10px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
}

export default SearchBar
