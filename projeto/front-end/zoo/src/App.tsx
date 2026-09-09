import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import HabitatPage, { type Habitat } from './pages/HabitatPage'
import HabitatAnimalsPage from './pages/HabitatAnimalsPage'
import BioterioPage from './pages/BioterioPage'
import EstoquePage from './pages/EstoquePage'
import BioterioAnotacoesPage from './pages/BioterioAnotacoesPage'
import HabitatAnotacoesPage from './pages/HabitatAnotacoesPage'
import EstoqueAnotacoesPage from './pages/EstoqueAnotacoesPage'
import LoginPage from './pages/LoginPage'
import UsuariosPage from './pages/UsuariosPage'
import { getHabitats, logout, obterUsuarioAutenticado, type UsuarioAutenticadoResponse } from './api'

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

function MainLayout({ usuarioLogado, onLogout }: { usuarioLogado: UsuarioLogado; onLogout: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = usuarioLogado.perfil === 'ADMINISTRADOR'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const formatarPerfil = (perfil: UsuarioLogado['perfil']) => {
    if (perfil === 'ADMINISTRADOR') return 'Administrador'
    if (perfil === 'FUNCIONARIO') return 'Funcionário'
    return perfil
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-paw">🐾</span>
          <span className="logo-text">
            <span className="logo-zoo">Zoo</span>Gestor
          </span>
          <button
            className="menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`sidebar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-item ${isActive('/habitats') ? 'active' : ''}`}
            onClick={() => navigate('/habitats')}
          >
            <span className="nav-icon">🌿</span>
            Habitats
          </button>
          <button
            className={`nav-item ${isActive('/bioterio') ? 'active' : ''}`}
            onClick={() => navigate('/bioterio')}
          >
            <span className="nav-icon">🧬</span>
            Bioterio
          </button>
          <button
            className={`nav-item ${isActive('/estoque') ? 'active' : ''}`}
            onClick={() => navigate('/estoque')}
          >
            <span className="nav-icon">📦</span>
            Estoque
          </button>
          {isAdmin && (
            <button
              className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}
              onClick={() => navigate('/usuarios')}
            >
              <span className="nav-icon">👤</span>
              Usuários
            </button>
          )}
        </nav>

        <div className={`sidebar-footer ${mobileMenuOpen ? 'open' : ''}`}>
          <button className="nav-item nav-item-logout" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            Sair
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <nav className="topbar-nav" />

          <div className="topbar-right">
            <div className="user-badge">
              <span className="user-name">{usuarioLogado.nome}</span>
              <span className="user-profile">{formatarPerfil(usuarioLogado.perfil)}</span>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function HabitatAnimalsRoute() {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const [habitat, setHabitat] = useState<Habitat | null>((location.state as { habitat?: Habitat } | null)?.habitat ?? null)
  const [loading, setLoading] = useState(!habitat)

  useEffect(() => {
    const habitatState = (location.state as { habitat?: Habitat } | null)?.habitat ?? null
    if (habitatState?.id && String(habitatState.id) === params.habitatId) {
      setHabitat(habitatState)
      setLoading(false)
      return
    }

    const habitatId = Number(params.habitatId)
    if (!Number.isFinite(habitatId)) {
      setHabitat(null)
      setLoading(false)
      return
    }

    let ativo = true
    setLoading(true)

    void getHabitats()
      .then((list) => {
        if (!ativo) return
        const lista = Array.isArray(list) ? (list as Habitat[]) : []
        const encontrado = lista.find((item) => item.id === habitatId) ?? null
        setHabitat(encontrado)
      })
      .catch(() => {
        if (ativo) setHabitat(null)
      })
      .finally(() => {
        if (ativo) setLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [location.state, params.habitatId])

  if (loading) {
    return <div className="loading">Carregando habitat...</div>
  }

  if (!habitat) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌿</div>
        <p>Habitat não encontrado.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/habitats')}>
          Voltar para Habitats
        </button>
      </div>
    )
  }

  return <HabitatAnimalsPage habitat={habitat} onBack={() => navigate('/habitats')} />
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)
  const navigate = useNavigate()

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
    navigate('/habitats', { replace: true })
  }

  const handleLogout = () => {
    void logout()
    setUsuarioLogado(null)
    navigate('/login', { replace: true })
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

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/habitats" replace />} />
      <Route element={<MainLayout usuarioLogado={usuarioLogado} onLogout={handleLogout} />}>
        <Route path="/" element={<Navigate to="/habitats" replace />} />
        <Route path="/habitats" element={<HabitatPage />} />
        <Route path="/habitats/anotacoes" element={<HabitatAnotacoesPage />} />
        <Route path="/habitats/:habitatId/animais" element={<HabitatAnimalsRoute />} />
        <Route path="/bioterio" element={<BioterioPage />} />
        <Route path="/bioterio/anotacoes" element={<BioterioAnotacoesPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/estoque/anotacoes" element={<EstoqueAnotacoesPage />} />
        {usuarioLogado.perfil === 'ADMINISTRADOR' && <Route path="/usuarios" element={<UsuariosPage />} />}
        <Route path="*" element={<Navigate to="/habitats" replace />} />
      </Route>
    </Routes>
  )
}

export default App
