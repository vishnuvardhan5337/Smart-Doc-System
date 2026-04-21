import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Global reset styles
const style = document.createElement('style')
style.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #212529; }
  a { color: inherit; }
`
document.head.appendChild(style)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)
