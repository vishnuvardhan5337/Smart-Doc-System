import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DocumentPage from './pages/DocumentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login.
 * Shows a loading state while checking saved auth token on mount.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<ProtectedRoute><HomePage /></ProtectedRoute>}
        />
        <Route
          path="/document/:id"
          element={<ProtectedRoute><DocumentPage /></ProtectedRoute>}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
        />
      </Routes>
    </>
  )
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App
