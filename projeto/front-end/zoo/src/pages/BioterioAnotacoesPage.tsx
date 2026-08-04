import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createBioterioAnotacao,
  deleteBioterioAnotacao,
  getBioterioAnotacoes,
  updateBioterioAnotacao,
} from '../api'
import '../styles/BioterioAnotacoesPage.css'

type BioterioAnotacoesPageProps = {
  onVoltar?: () => void
}

type BioterioAnotacao = {
  id: number
  dataAnotacao: string
  texto: string
  autorNome: string | null
  dataCriacao: string | null
}

const textoOuTraco = (valor?: string | null) => {
  const texto = valor?.trim()
  return texto && texto.length > 0 ? texto : '—'
}

function formatarData(dataIso: string | null) {
  if (!dataIso) return '—'
  const data = new Date(`${dataIso}T00:00:00`)
  if (Number.isNaN(data.getTime())) return dataIso
  return data.toLocaleDateString('pt-BR')
}

function formatarDataHora(dataHoraIso: string | null) {
  if (!dataHoraIso) return '—'
  const data = new Date(dataHoraIso)
  if (Number.isNaN(data.getTime())) return dataHoraIso
  return data.toLocaleString('pt-BR')
}

export default function BioterioAnotacoesPage({ onVoltar }: BioterioAnotacoesPageProps) {
  const [anotacoes, setAnotacoes] = useState<BioterioAnotacao[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingEdicao, setSavingEdicao] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTexto, setEditingTexto] = useState('')
  const [form, setForm] = useState({
    texto: '',
  })

  const carregarAnotacoes = async () => {
    try {
      setLoading(true)
      setError(null)
      const dataApi = await getBioterioAnotacoes()
      setAnotacoes(Array.isArray(dataApi) ? (dataApi as BioterioAnotacao[]) : [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregarAnotacoes()
  }, [])

  const handleSalvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const texto = form.texto
    if (!texto.trim()) {
      setError('Digite uma anotação antes de salvar.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      await createBioterioAnotacao({
        dataAnotacao: null,
        texto,
      })

      setForm({ texto: '' })
      await carregarAnotacoes()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const limparFiltro = () => {
    setFiltroInicio('')
    setFiltroFim('')
  }

  const iniciarEdicao = (anotacao: BioterioAnotacao) => {
    setEditingId(anotacao.id)
    setEditingTexto(anotacao.texto ?? '')
    setError(null)
  }

  const cancelarEdicao = () => {
    setEditingId(null)
    setEditingTexto('')
  }

  const salvarEdicao = async (id: number) => {
    if (!editingTexto.trim()) {
      setError('A anotação não pode ser vazia.')
      return
    }

    try {
      setSavingEdicao(true)
      setError(null)
      await updateBioterioAnotacao(id, {
        texto: editingTexto,
      })
      cancelarEdicao()
      await carregarAnotacoes()
    } catch (e) {
      setError(String(e))
    } finally {
      setSavingEdicao(false)
    }
  }

  const excluirAnotacao = async (id: number) => {
    if (!window.confirm('Deseja excluir esta anotação?')) return

    try {
      setDeletingId(id)
      setError(null)
      await deleteBioterioAnotacao(id)
      if (editingId === id) {
        cancelarEdicao()
      }
      await carregarAnotacoes()
    } catch (e) {
      setError(String(e))
    } finally {
      setDeletingId(null)
    }
  }

  const anotacoesFiltradas = useMemo(() => {
    if (!filtroInicio && !filtroFim) return anotacoes

    const inicio = filtroInicio ? new Date(`${filtroInicio}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
    const fim = filtroFim ? new Date(`${filtroFim}T23:59:59`).getTime() : Number.POSITIVE_INFINITY

    return anotacoes.filter((anotacao) => {
      const base = anotacao.dataCriacao || `${anotacao.dataAnotacao}T00:00:00`
      const dataMs = new Date(base).getTime()
      if (Number.isNaN(dataMs)) return false
      return dataMs >= inicio && dataMs <= fim
    })
  }, [anotacoes, filtroInicio, filtroFim])

  const subtitulo = useMemo(() => {
    if (!filtroInicio && !filtroFim) {
      return 'Registre informações livres. A data da anotação é preenchida automaticamente ao salvar.'
    }

    if (filtroInicio && filtroFim) {
      return `Filtrando de ${formatarData(filtroInicio)} até ${formatarData(filtroFim)}.`
    }

    if (filtroInicio) {
      return `Filtrando a partir de ${formatarData(filtroInicio)}.`
    }

    return `Filtrando até ${formatarData(filtroFim)}.`
  }, [filtroInicio, filtroFim])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anotações do Biotério</h1>
          <p className="page-subtitle">{subtitulo}</p>
        </div>
        <div className="page-actions">
          {onVoltar && (
            <button type="button" className="btn-secondary" onClick={onVoltar}>
              ← Voltar para Biotério
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <h2 className="section-title">Nova anotação</h2>

      <section className="card">
        <form onSubmit={handleSalvar} className="modal-form" style={{ width: '100%' }}>
          <label style={{ width: '100%', alignItems: 'stretch', textAlign: 'left' }}>
            Texto da anotação
            <textarea
              rows={10}
              value={form.texto}
              onChange={(e) => setForm((prev) => ({ ...prev, texto: e.target.value }))}
              placeholder="Ex: Verificar caixa 12 após limpeza da manhã..."
              style={{ display: 'block', width: '100%', minHeight: 320 }}
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar anotação'}
            </button>
          </div>
        </form>
      </section>

      <h2 className="section-title" style={{ marginTop: 20 }}>Histórico de anotações</h2>

      <form className="anotacoes-filter-bare">
        <label className="anotacoes-filter-label-compact">
          Data inicial
          <input
            type="date"
            value={filtroInicio}
            onChange={(e) => setFiltroInicio(e.target.value)}
          />
        </label>

        <label className="anotacoes-filter-label-compact">
          Data final
          <input
            type="date"
            value={filtroFim}
            onChange={(e) => setFiltroFim(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn-secondary anotacoes-filter-btn"
          onClick={limparFiltro}
          disabled={loading}
        >
          Limpar
        </button>
      </form>

      <section style={{ marginTop: 16 }}>
        {loading ? (
          <div className="loading">Carregando anotações...</div>
        ) : anotacoesFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>Nenhuma anotação encontrada para o filtro atual.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Anotação</th>
                  <th>Criada em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {anotacoesFiltradas.map((anotacao) => (
                  <tr key={anotacao.id}>
                    <td>{textoOuTraco(anotacao.autorNome)}</td>
                    <td style={{ verticalAlign: 'top' }}>
                      {editingId === anotacao.id ? (
                        <textarea
                          rows={8}
                          value={editingTexto}
                          onChange={(e) => setEditingTexto(e.target.value)}
                          style={{ width: '100%', minHeight: 180 }}
                        />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{anotacao.texto || '—'}</div>
                      )}
                    </td>
                    <td>{formatarDataHora(anotacao.dataCriacao)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {editingId === anotacao.id ? (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => salvarEdicao(anotacao.id)}
                              disabled={savingEdicao}
                            >
                              {savingEdicao ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={cancelarEdicao} disabled={savingEdicao}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="btn-secondary" onClick={() => iniciarEdicao(anotacao)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => excluirAnotacao(anotacao.id)}
                              disabled={deletingId === anotacao.id}
                            >
                              {deletingId === anotacao.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
