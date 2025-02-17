import { createRoot } from 'react-dom/client'
import App from './components/app'
import React from 'react'

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('main-view') as HTMLElement)
  root.render(<App />)
})
