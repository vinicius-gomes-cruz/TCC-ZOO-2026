import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  atualizarUsuario,
  criarUsuario,
  listarUsuarios,
  type PerfilUsuario,
  type UsuarioSistemaRequest,
  type UsuarioSistemaResponse,
} from '../api'
import '../styles/UsuariosPage.css'

type FormState = {
  nome: string
  email: string
  senha: string
  perfil: PerfilUsuario
  ativo: boolean
}

const FORM_INICIAL: FormState = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'FUNCIONARIO',
  ativo: true,
}

function formatarPerfil(perfil: PerfilUsuario) {
  return perfil === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário'
}

function extrairMensagemErro(error: unknown, fallback: string) {
  const mensagem = String(error)
  if (mensagem.includes('HTTP 403')) {
    return 'Acesso negado. Apenas administradores podem gerenciar usuários.'
  }
  if (mensagem.includes('HTTP 401')) {
    return 'Sua sessão expirou. Faça login novamente.'
  }
  return fallback
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistemaResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<UsuarioSistemaResponse | null>(null)
  const [form, setForm] = useState<FormState>(FORM_INICIAL)

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listarUsuarios()
      setUsuarios(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(extrairMensagemErro(e, 'Não foi possível carregar os usuários.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregarUsuarios()
  }, [])

  const abrirCriacao = () => {
    setEditingUsuario(null)
    setForm(FORM_INICIAL)
    setShowModal(true)
  }

  const abrirEdicao = (usuario: UsuarioSistemaResponse) => {
    setEditingUsuario(usuario)
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingUsuario(null)
    setForm(FORM_INICIAL)
  }

  const montarPayload = (): UsuarioSistemaRequest | null => {
    const nome = form.nome.trim()
    const email = form.email.trim().toLowerCase()
    const senha = form.senha.trim()

    if (!nome || !email) {
      setError('Nome e e-mail são obrigatórios.')
      return null
    }

    if (!editingUsuario && !senha) {
      setError('Senha é obrigatória ao criar usuário.')
      return null
    }

    if (editingUsuario) {
      return {
        nome,
        email,
        perfil: form.perfil,
        ativo: form.ativo,
        ...(senha ? { senha } : {}),
      }
    }

    return {
      nome,
      email,
      senha,
      perfil: form.perfil,
      ativo: form.ativo,
    }
  }

  const salvarUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const payload = montarPayload()
    if (!payload) return

    try {
      setSaving(true)
      if (editingUsuario) {
        await atualizarUsuario(editingUsuario.id, payload)
      } else {
        await criarUsuario(payload)
      }

      fecharModal()
      await carregarUsuarios()
    } catch (e) {
      setError(extrairMensagemErro(e, 'Não foi possível salvar o usuário.'))
    } finally {
      setSaving(false)
    }
  }

  const alternarStatusUsuario = async (usuario: UsuarioSistemaResponse) => {
    const acao = usuario.ativo ? 'inativar' : 'ativar'
    if (!window.confirm(`Deseja ${acao} o usuário ${usuario.nome}?`)) return

    try {
      setSaving(true)
      setError(null)
      await atualizarUsuario(usuario.id, {
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: !usuario.ativo,
      })
      await carregarUsuarios()
    } catch (e) {
      setError(extrairMensagemErro(e, 'Não foi possível atualizar o status do usuário.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Usuários</h1>
          <p className="page-subtitle">Apenas administradores podem adicionar, editar e ativar/inativar usuários.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-primary" onClick={abrirCriacao} disabled={saving}>
            + Novo usuário
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Carregando usuários...</div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p>Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="font-weight-bold">{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`usuario-perfil-badge ${usuario.perfil === 'ADMINISTRADOR' ? 'admin' : 'funcionario'}`}>
                      {formatarPerfil(usuario.perfil)}
                    </span>
                  </td>
                  <td>
                    <span className={`usuario-status-badge ${usuario.ativo ? 'ativo' : 'inativo'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="usuario-actions">
                      <button type="button" className="btn-secondary" onClick={() => abrirEdicao(usuario)} disabled={saving}>
                        Editar
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => alternarStatusUsuario(usuario)} disabled={saving}>
                        {usuario.ativo ? 'Inativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUsuario ? 'Editar usuário' : 'Novo usuário'}</h2>
              <button type="button" className="modal-close" onClick={fecharModal} aria-label="Fechar modal">
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={salvarUsuario}>
              <label>
                Nome
                <input
                  type="text"
                  value={form.nome}
                  onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>

              <label>
                Perfil
                <select
                  value={form.perfil}
                  onChange={(event) => setForm((prev) => ({ ...prev, perfil: event.target.value as PerfilUsuario }))}
                >
                  <option value="FUNCIONARIO">Funcionário</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.ativo ? 'true' : 'false'}
                  onChange={(event) => setForm((prev) => ({ ...prev, ativo: event.target.value === 'true' }))}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </label>

              <label>
                Senha {editingUsuario ? '(deixe em branco para manter)' : ''}
                <input
                  type="password"
                  value={form.senha}
                  onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
                  required={!editingUsuario}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={fecharModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
