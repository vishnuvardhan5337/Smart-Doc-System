require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth')
const documentRoutes = require('./routes/documents')

const app = express()

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from the React frontend.
// Common dev mismatch: frontend opened via 127.0.0.1 while backend allows only localhost.
const defaultDevOrigins = new Set(['http://localhost:3000', 'http://127.0.0.1:3000'])
if (process.env.CLIENT_URL) defaultDevOrigins.add(process.env.CLIENT_URL)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header), like curl/postman.
      if (!origin) return callback(null, true)

      // Allow explicit origins.
      if (defaultDevOrigins.has(origin)) return callback(null, true)

      // In development, allow any localhost/127.0.0.1 port (useful if React runs on 3001, etc.).
      if (
        (process.env.NODE_ENV || 'development') === 'development' &&
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked origin: ${origin}`))
    }
  })
)

// Parse incoming JSON request bodies
app.use(express.json())

// Serve uploaded PDFs as static files
// e.g., http://localhost:8000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)

// Health check endpoint — useful for deployment monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler — catches any unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  })
}

startServer()
