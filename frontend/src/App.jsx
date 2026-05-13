import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function App() {
  const [urls, setUrls] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Load all URLs
  const fetchUrls = async () => {
    try {
      const res = await axios.get(`${API}/history`)
      setUrls(res.data)
    } catch (e) {
      console.error('Could not fetch URLs')
    }
  }

  useEffect(() => { fetchUrls() }, [])

  // Shorten a URL
  const handleShorten = async () => {
    if (!input) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/shorten`, { url: input })
      setMessage(`✅ Shortened: ${res.data.shortUrl}`)
      setInput('')
      fetchUrls()
    } catch (e) {
      setMessage('❌ Error shortening URL')
    }
    setLoading(false)
  }

  // Delete a URL
  const handleDelete = async (code) => {
    if (!confirm('Delete this link?')) return
    try {
      await axios.delete(`${API}/${code}`)
      fetchUrls()
    } catch (e) {
      console.error('Could not delete')
    }
  }

  // Copy to clipboard
  const handleCopy = (code) => {
    navigator.clipboard.writeText(`${API}/${code}`)
    setMessage('📋 Copied to clipboard!')
    setTimeout(() => setMessage(''), 2000)
  }

  // Filter by search
  const filtered = urls.filter(u =>
    u.original.toLowerCase().includes(search.toLowerCase()) ||
    u.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔗 URL Shortener Dashboard</h1>

      {/* Shorten box */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Shorten a URL</h2>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Paste a long URL..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleShorten()}
          />
          <button
            style={styles.btnPrimary}
            onClick={handleShorten}
            disabled={loading}
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Search */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Your Links ({urls.length})</h2>
        <input
          style={{ ...styles.input, marginBottom: '16px' }}
          placeholder="Search by URL or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Original URL</th>
              <th style={styles.th}>Clicks</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                  No links found
                </td>
              </tr>
            )}
            {filtered.map(url => (

              
              <tr key={url.code} style={styles.tableRow}>
                <td style={styles.td}>
                  <a
                    href={`${API}/${url.code}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    {url.code}
                  </a>
                </td>
                <td style={{ ...styles.td, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {url.original}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <span style={styles.badge}>{url.clicks}</span>
                </td>
                <td style={styles.td}>
                  {new Date(url.created_at).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.btnSecondary}
                    onClick={() => handleCopy(url.code)}
                  >
                    Copy
                  </button>
                  <button
                    style={styles.btnDanger}
                    onClick={() => handleDelete(url.code)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Styles
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 16px',
    fontFamily: 'system-ui, sans-serif',
    color: '#1a1a1a',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#374151',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  btnPrimary: {
    padding: '10px 20px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  btnSecondary: {
    padding: '6px 12px',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    marginRight: '6px',
  },
  btnDanger: {
    padding: '6px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#6366f1',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f9fafb',
  },
  tableRow: {
    borderTop: '1px solid #f3f4f6',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500',
  },
  badge: {
    background: '#ede9fe',
    color: '#7c3aed',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '500',
  },
}

export default App