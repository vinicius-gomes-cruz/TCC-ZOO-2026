import { useEffect, useState } from 'react'
import './App.css'
import HabitatPage, { type Habitat } from './pages/HabitatPage'
import HabitatAnimalsPage from './pages/HabitatAnimalsPage'
import BioterioPage from './pages/BioterioPage'
import EstoquePage from './pages/EstoquePage'
import LoginPage from './pages/LoginPage'
import { logout, obterUsuarioAutenticado, type UsuarioLoginResponse } from './api'

type Page = 'habitats' | 'habitat-animals' | 'bioterio' | 'estoque'
type UsuarioLogado = { nome: string; email: string; perfil: UsuarioLoginResponse['perfil']; token: string }
const SESSION_STORAGE_KEY = 'zooGestor.session'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('habitats')
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null)
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    const restaurarSessao = async () => {
      const sessaoSalva = localStorage.getItem(SESSION_STORAGE_KEY)

      if (!sessaoSalva) {
        setCarregandoSessao(false)
        return
      }

      try {
        const sessao = JSON.parse(sessaoSalva) as UsuarioLogado

        if (!sessao?.token) {
          localStorage.removeItem(SESSION_STORAGE_KEY)
          setCarregandoSessao(false)
          return
        }

        const usuarioAtual = await obterUsuarioAutenticado(sessao.token)
        setUsuarioLogado({
          nome: usuarioAtual.nome,
          email: usuarioAtual.email,
          perfil: usuarioAtual.perfil,
          token: sessao.token,
        })
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY)
      } finally {
        setCarregandoSessao(false)
      }
    }

    void restaurarSessao()
  }, [])

  const handleLogin = (usuario: UsuarioLoginResponse) => {
    const sessao: UsuarioLogado = {
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      token: usuario.token,
    }

    setUsuarioLogado(sessao)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessao))
  }

  const formatarPerfil = (perfil: UsuarioLogado['perfil']) => {
    if (perfil === 'ADMINISTRADOR') return 'Administrador'
    if (perfil === 'FUNCIONARIO') return 'Funcionário'
    return perfil
  }

  const handleLogout = () => {
    if (usuarioLogado?.token) {
      void logout(usuarioLogado.token)
    }

    localStorage.removeItem(SESSION_STORAGE_KEY)
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
        </main>
      </div>
    </div>
  )
}

export default App
