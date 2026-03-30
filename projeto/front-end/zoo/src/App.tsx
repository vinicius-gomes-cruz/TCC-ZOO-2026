import { useState } from 'react'
import './App.css'
import HabitatPage, { type Habitat } from './pages/HabitatPage'
import HabitatAnimalsPage from './pages/HabitatAnimalsPage'

type Page = 'habitats' | 'habitat-animals'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('habitats')
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null)

  const openHabitatAnimals = (habitat: Habitat) => {
    setSelectedHabitat(habitat)
    setCurrentPage('habitat-animals')
  }

  const backToHabitats = () => {
    setCurrentPage('habitats')
  }

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
              className={`topbar-tab ${currentPage !== 'habitat-animals' ? 'active' : ''}`}
              onClick={() => setCurrentPage('habitats')}
            >
              Habitats
            </button>
            {currentPage === 'habitat-animals' && selectedHabitat && (
              <button className="topbar-tab active" disabled>
                {selectedHabitat.nome}
              </button>
            )}
          </nav>
          <div className="topbar-right">
            <div className="user-badge">Admin</div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          {currentPage === 'habitats' && <HabitatPage onOpenHabitat={openHabitatAnimals} />}
          {currentPage === 'habitat-animals' && selectedHabitat && (
            <HabitatAnimalsPage habitat={selectedHabitat} onBack={backToHabitats} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
