import { useState } from 'react'
import './App.css'
import HabitatPage from './pages/HabitatPage'

type Page = 'habitats'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('habitats')

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-paw">🐾</span>
          <span className="logo-text">
            <span className="logo-zoo">Zoo</span>Gestor
          </span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'habitats' ? 'active' : ''}`}
            onClick={() => setCurrentPage('habitats')}
          >
            <span className="nav-icon">🌿</span>
            Habitats
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <span className="nav-icon">⚙️</span>
            Configurações
          </button>
        </div>
      </aside>

      {/* Right side */}
      <div className="main-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <nav className="topbar-nav">
            <button
              className={`topbar-tab ${currentPage === 'habitats' ? 'active' : ''}`}
              onClick={() => setCurrentPage('habitats')}
            >
              Habitats
            </button>
          </nav>
          <div className="topbar-right">
            <button className="icon-btn" title="Notificações">🔔</button>
            <div className="user-badge">Admin</div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          {currentPage === 'habitats' && <HabitatPage />}
        </main>
      </div>
    </div>
  )
}

export default App
