import { useEffect, useState } from 'react'
import './App.css'
import HabitatPage, { type Habitat } from './pages/HabitatPage'
import HabitatAnimalsPage from './pages/HabitatAnimalsPage'
import BioterioPage from './pages/BioterioPage'
import EstoquePage from './pages/EstoquePage'
import LoginPage from './pages/LoginPage'
import UsuariosPage from './pages/UsuariosPage'
import { logout, obterUsuarioAutenticado, type UsuarioAutenticadoResponse } from './api'

type Page = 'habitats' | 'habitat-animals' | 'bioterio' | 'estoque' | 'usuarios'
type UsuarioLogado = { nome: string; usuario: string; perfil: UsuarioAutenticadoResponse['perfil'] }

function isUsuarioAutenticadoResponse(value: unknown): value is UsuarioAutenticadoResponse {
  if (!value || typeof value !== 'object') return false

  const v = value as Record<string, unknown>
  return (
    typeof v.nome === 'string' &&
    typeof v.usuario === 'string' &&
    (v.perfil === 'ADMINISTRADOR' || v.perfil === 'FUNCIONARIO')
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('habitats')
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null)
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    const restaurarSessao = async () => {
      try {
        const usuarioAtual = await obterUsuarioAutenticado()

        if (!isUsuarioAutenticadoResponse(usuarioAtual)) {
          throw new Error('Resposta inválida de /api/auth/me')
        }

        setUsuarioLogado({
          nome: usuarioAtual.nome,
          usuario: usuarioAtual.usuario,
          perfil: usuarioAtual.perfil,
        })
      } catch {
        // Usuário não autenticado ou sessão expirada
        setUsuarioLogado(null)
      } finally {
        setCarregandoSessao(false)
      }
    }

    void restaurarSessao()
  }, [])

  const handleLogin = (usuario: UsuarioAutenticadoResponse) => {
    setUsuarioLogado({
      nome: usuario.nome,
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    })
  }

  const formatarPerfil = (perfil: UsuarioLogado['perfil']) => {
    if (perfil === 'ADMINISTRADOR') return 'Administrador'
    if (perfil === 'FUNCIONARIO') return 'Funcionário'
    return perfil
  }

  const handleLogout = () => {
    void logout()
    setUsuarioLogado(null)
    setCurrentPage('habitats')
    setSelectedHabitat(null)
  }

  if (carregandoSessao) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="login-brand-subtitle">Restaurando sessão...</p>
        </div>
      </div>
    )
  }

  if (!usuarioLogado) {
    return <LoginPage onLogin={handleLogin} />
  }

  const isAdmin = usuarioLogado.perfil === 'ADMINISTRADOR'

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
          {isAdmin && (
            <button
              className={`nav-item ${currentPage === 'usuarios' ? 'active' : ''}`}
              onClick={() => setCurrentPage('usuarios')}
            >
              <span className="nav-icon">👤</span>
              Usuários
            </button>
          )}
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
            <div className="user-badge">
              <span className="user-name">{usuarioLogado.nome}</span>
              <span className="user-profile">{formatarPerfil(usuarioLogado.perfil)}</span>
            </div>
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
          {currentPage === 'usuarios' && isAdmin && <UsuariosPage />}
        </main>
      </div>
    </div>
  )
}

export default App
