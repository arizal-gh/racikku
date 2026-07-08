import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initSyncEngine } from './lib/sync'

// Nyalakan sync engine sekali di awal. Semua logic offline-first
// tinggal jalan sendiri di background setelah ini.
initSyncEngine()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
