import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        📄 Smart Doc System
      </div>
      {user && (
        <div style={styles.right}>
          <span style={styles.username}>👤 {user.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: { background: '#1a1a2e', color: 'white', padding: '0 30px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  username: { fontSize: '14px', opacity: 0.8 },
  logoutBtn: { padding: '6px 14px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px', cursor: 'pointer' }
}

export default Navbar
