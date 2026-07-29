import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, type UsuarioAutenticadoResponse, obterUsuarioAutenticado } from '../api'

type LoginPageProps = {
  onLogin: (usuario: UsuarioAutenticadoResponse) => void
}

function isUsuarioAutenticadoResponse(value: unknown): value is UsuarioAutenticadoResponse {
  if (!value || typeof value !== 'object') return false

  const v = value as Record<string, unknown>
  return (
    typeof v.nome === 'string' &&
    typeof v.email === 'string' &&
    (v.perfil === 'ADMINISTRADOR' || v.perfil === 'FUNCIONARIO')
  )
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro('')

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha para continuar.')
      return
    }

    try {
      setCarregando(true)
      await login({ email: email.trim(), senha: senha.trim() })
      // Cookies são configurados automaticamente pelo servidor
      // Agora obter os dados do usuário autenticado
      const usuario = await obterUsuarioAutenticado()

      if (!isUsuarioAutenticadoResponse(usuario)) {
        throw new Error('Resposta inválida de /api/auth/me')
      }

      onLogin(usuario)
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-icon">🐾</span>
          <h1 className="login-brand-title">ZooGestor</h1>
          <p className="login-brand-subtitle">Acesso ao sistema interno do zoológico</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seuemail@zoo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />

          {erro && <p className="login-error">{erro}</p>}

          <button type="submit" className="btn-primary login-submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
