import { useState } from 'react'
import './App.css'
import HabitatPage, { type Habitat } from './pages/HabitatPage'
import HabitatAnimalsPage from './pages/HabitatAnimalsPage'
import BioterioPage from './pages/BioterioPage'
import EstoquePage from './pages/EstoquePage'
import LoginPage from './pages/LoginPage'

type Page = 'habitats' | 'habitat-animals' | 'bioterio' | 'estoque'
type UsuarioLogado = { nome: string; email: string }

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('habitats')
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null)
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)

  const handleLogin = (email: string) => {
    const nome = email.split('@')[0]?.trim() || 'Usuário'
    setUsuarioLogado({ nome, email })
  }

  const handleLogout = () => {
    setUsuarioLogado(null)
    setCurrentPage('habitats')
    setSelectedHabitat(null)
  }

  if (!usuarioLogado) {
    return <LoginPage onLogin={handleLogin} />
  }

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
          <button
            className={`nav-item ${currentPage === 'bioterio' ? 'active' : ''}`}
            onClick={() => setCurrentPage('bioterio')}
          >
            <span className="nav-icon">🧬</span>
            Bioterio
          </button>
          <button
            className={`nav-item ${currentPage === 'estoque' ? 'active' : ''}`}
            onClick={() => setCurrentPage('estoque')}
          >
            <span className="nav-icon">📦</span>
            Estoque
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item nav-item-logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Right side */}
      <div className="main-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <nav className="topbar-nav">
            {currentPage === 'habitat-animals' && selectedHabitat && (
              <button className="topbar-tab active" disabled>
                {selectedHabitat.nome}
              </button>
            )}
          </nav>

          <div className="topbar-right">
            <span className="user-badge">{usuarioLogado.nome}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          {currentPage === 'habitats' && <HabitatPage onOpenHabitat={openHabitatAnimals} />}
          {currentPage === 'habitat-animals' && selectedHabitat && (
            <HabitatAnimalsPage habitat={selectedHabitat} onBack={backToHabitats} />
          )}
          {currentPage === 'bioterio' && <BioterioPage />}
          {currentPage === 'estoque' && <EstoquePage />}
        </main>
      </div>
    </div>
  )
}

export default App
