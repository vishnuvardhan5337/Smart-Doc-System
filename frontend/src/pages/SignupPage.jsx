import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const res = await authAPI.signup(form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📄 Smart Doc System</h1>
        <h2 style={styles.subtitle}>Create Account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.input}
            placeholder="Vishnu Vardhan"
            required
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
            placeholder="you@example.com"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
            placeholder="Min. 6 characters"
            required
          />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { textAlign: 'center', marginBottom: '4px', fontSize: '22px' },
  subtitle: { textAlign: 'center', marginBottom: '24px', color: '#6c757d', fontWeight: 'normal' },
  error: { background: '#f8d7da', color: '#842029', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#495057' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '15px', marginBottom: '16px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6c757d' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '600' }
}

export default SignupPage
