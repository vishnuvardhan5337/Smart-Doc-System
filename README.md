# 📄 Smart Document System

A production-grade full-stack application for uploading, processing, searching, and summarizing PDF documents using AI.

Built with **React**, **Node.js (Express)**, and **MongoDB**.

---

## Features

- **PDF Upload** — Upload PDFs with real-time progress tracking
- **Async Text Extraction** — Non-blocking extraction via Bull queue + Redis
- **Full-Text Search** — MongoDB text indexing with matched term highlighting
- **AI Summarization** — Groq (Llama 3) powered document summaries
- **JWT Authentication** — Secure per-user document isolation
- **Document Status Tracking** — pending → processing → completed → failed
- **Pagination** — Handles large document collections efficiently
- **Error Handling** — Global error handler for all edge cases

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Queue | Bull, Redis |
| PDF Parsing | pdf-parse |
| AI Summarization | Groq API (Llama 3) |

---

## Project Structure

```
smart-doc-system/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Business logic (auth, documents)
│   │   ├── middleware/      # JWT auth, file upload, error handler
│   │   ├── models/         # Mongoose schemas (User, Document)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # PDF parsing, AI summarization, queue
│   │   ├── utils/          # ApiError, asyncHandler
│   │   ├── workers/        # Background extraction worker
│   │   └── server.js       # App entry point
│   ├── uploads/            # Stored PDFs (gitignored)
│   └── .env.example
└── frontend/
    └── src/
        ├── components/     # Navbar, UploadForm, SearchBar, DocumentList
        ├── context/        # AuthContext (global auth state)
        ├── pages/          # Login, Signup, Home, Document
        └── services/       # Axios API calls
```

---

## Prerequisites

- Node.js v18+
- MongoDB
- Redis
- Groq API key (free at [console.groq.com](https://console.groq.com))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-doc-system.git
cd smart-doc-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
mkdir -p uploads
```

Fill in your `.env` file:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smartdocs
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

### 4. Start services (Mac)

```bash
brew services start mongodb-community
brew services start redis
```

### 5. Run the project

Open **3 terminal tabs**:

```bash
# Terminal 1 - Backend server
cd backend && npm run dev

# Terminal 2 - Extraction worker
cd backend && npm run worker

# Terminal 3 - Frontend
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Documents (require Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload PDF |
| GET | `/api/documents` | List all documents (paginated) |
| GET | `/api/documents/:id` | Get one document |
| GET | `/api/documents/search?q=` | Full-text search |
| POST | `/api/documents/:id/summarize` | Generate AI summary |
| DELETE | `/api/documents/:id` | Delete document |

---

## How It Works

### Async PDF Processing

```
User uploads PDF
      ↓
Express saves file → returns 202 immediately
      ↓
Bull queue receives extraction job
      ↓
Worker extracts text using pdf-parse
      ↓
MongoDB updated with extracted text + status: completed
      ↓
Frontend auto-refreshes until status is completed
```

### Authentication Flow

```
Signup/Login → JWT token generated
      ↓
Token stored in localStorage
      ↓
Every request sends: Authorization: Bearer <token>
      ↓
Backend verifies token → attaches user to request
      ↓
Documents filtered by user ID
```

---

## Architecture Decisions

**Why async queue for extraction?**
PDF parsing is CPU-intensive. Synchronous extraction blocks the Express event loop. Bull + Redis lets us return a response immediately and process in the background, with automatic retries on failure.

**Why JWT over sessions?**
JWTs are stateless — no server-side session storage needed. Scales horizontally without shared state.

**Why MongoDB text index?**
Built-in full-text search without needing a separate search service. The weighted index ranks filename matches higher than body text matches.

**Why separate the worker process?**
If extraction crashes, the API server stays up. Workers can scale independently based on queue depth.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g. 7d) |
| `GROQ_API_KEY` | Groq API key for AI summarization |
| `REDIS_HOST` | Redis host (default: localhost) |
| `REDIS_PORT` | Redis port (default: 6379) |

---

## License

MIT
