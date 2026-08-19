import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createCaixa,
  deleteCaixa,
  enviarRacaoParaBioterio,
  finalizarRacaoNoBioterio,
  getCaixas,
  listarRacoesDisponiveis,
  listarRacoesNoBioterio,
  updateCaixa,
  type CaixaRequestPayload,
  type ItemEstoqueRacao,
} from '../api'
import BioterioAnotacoesPage from './BioterioAnotacoesPage'

type Caixa = {
  id: number
  numeroCaixa: number
  grupoFemeas: string | null
  crias: string | null
  machosRotativos: string | null
  dataNascimento: string | null
  dataDesmame: string | null
}

const textoOuTraco = (valor?: string | null) => {
  const texto = valor?.trim()
  return texto && texto.length > 0 ? texto : '—'
}

export default function BioterioPage() {
  const [telaInterna, setTelaInterna] = useState<'caixas' | 'anotacoes'>('caixas')
  const [caixas, setCaixas] = useState<Caixa[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCaixa, setEditingCaixa] = useState<Caixa | null>(null)
  const [racoesDisponiveis, setRacoesDisponiveis] = useState<ItemEstoqueRacao[]>([])
  const [racoesNoBioterio, setRacoesNoBioterio] = useState<ItemEstoqueRacao[]>([])
  const [showPegarRacao, setShowPegarRacao] = useState(false)
  const [racaoSelecionada, setRacaoSelecionada] = useState('')
  const [pacotesParaEnviar, setPacotesParaEnviar] = useState('')
  const [form, setForm] = useState({
    grupoFemeas: '',
    crias: '',
    machosRotativos: '',
    dataNascimento: '',
    dataDesmame: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)

    getCaixas()
      .then((list) => setCaixas(Array.isArray(list) ? (list as Caixa[]) : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))

    listarRacoesDisponiveis()
      .then((list) => setRacoesDisponiveis(Array.isArray(list) ? list : []))
      .catch(() => setRacoesDisponiveis([]))

    listarRacoesNoBioterio()
      .then((list) => setRacoesNoBioterio(Array.isArray(list) ? list : []))
      .catch(() => setRacoesNoBioterio([]))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    setError(null)

    try {
      setSaving(true)
      await createCaixa({})
      load()
    } catch (e) {
      setShowModal(false)
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (caixa: Caixa) => {
    if (!window.confirm(`Deseja excluir a Caixa #${caixa.id}?`)) return

    try {
      setSaving(true)
      setError(null)
      await deleteCaixa(caixa.id)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (caixa: Caixa) => {
    setError(null)
    setEditingCaixa(caixa)
    setForm({
      grupoFemeas: caixa.grupoFemeas ?? '',
      crias: caixa.crias ?? '',
      machosRotativos: caixa.machosRotativos ?? '',
      dataNascimento: caixa.dataNascimento ?? '',
      dataDesmame: caixa.dataDesmame ?? '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCaixa(null)
  }

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingCaixa) return

    const payload: CaixaRequestPayload = {
      numeroCaixa: editingCaixa.numeroCaixa ?? null,
      grupoFemeas: form.grupoFemeas.trim() || null,
      crias: form.crias.trim() || null,
      machosRotativos: form.machosRotativos.trim() || null,
      dataNascimento: form.dataNascimento || null,
      dataDesmame: form.dataDesmame || null,
    }

    try {
      setSaving(true)
      setError(null)
      await updateCaixa(editingCaixa.id, payload)
      closeModal()
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarParaBioterio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = Number(racaoSelecionada)
    const pacotes = Number(pacotesParaEnviar)
    if (!id) {
      setError('Selecione uma ração')
      return
    }
    if (!Number.isInteger(pacotes) || pacotes <= 0) {
      setError('Informe um número inteiro de pacotes válido')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await enviarRacaoParaBioterio(id, pacotes)
      setShowPegarRacao(false)
      setRacaoSelecionada('')
      setPacotesParaEnviar('')
      load()
    } catch (e) {
      setError('Não foi possível enviar a ração para o biotério.')
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizarRacao = async (id: number) => {
    if (!window.confirm('Confirma que esta ração acabou? Ela será removida do estoque.')) return

    try {
      setSaving(true)
      setError(null)
      await finalizarRacaoNoBioterio(id)
      load()
    } catch (e) {
      setError('Não foi possível finalizar a ração.')
    } finally {
      setSaving(false)
    }
  }

  if (telaInterna === 'anotacoes') {
    return <BioterioAnotacoesPage onVoltar={() => setTelaInterna('caixas')} />
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bioterio</h1>
          <p className="page-subtitle">Gerencie as caixas do biotério</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setTelaInterna('anotacoes')}>
            Ver anotações
          </button>
          <button className="btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Criando...' : '+ Novo Item'}
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-container" style={{ marginBottom: 16, padding: 16 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>Ração no biotério</h2>

        {racoesNoBioterio.length === 0 ? (
          <p style={{ marginTop: 0 }}>Nenhuma ração no biotério no momento.</p>
        ) : (
          <table className="table" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Ração</th>
                <th>Pacotes</th>
                <th>Peso Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {racoesNoBioterio.map((r) => (
                <tr key={r.id}>
                  <td className="font-weight-bold">{r.nome}</td>
                  <td>{r.quantidadePacotes ?? '—'}</td>
                  <td>{r.quantidade} {r.unidade}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleFinalizarRacao(r.id)} disabled={saving}>
                      Acabou
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {racoesDisponiveis.length > 0 && (
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowPegarRacao(true)} disabled={saving}>
            Pegar ração do estoque
          </button>
        )}

        {showPegarRacao && (
          <div className="modal-overlay" onClick={() => setShowPegarRacao(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Pegar ração do estoque</h2>
                <button className="modal-close" onClick={() => setShowPegarRacao(false)} aria-label="Fechar modal">
                  ✕
                </button>
              </div>

              {error && <div className="alert-error">{error}</div>}

              <form className="modal-form" onSubmit={handleEnviarParaBioterio}>
                <label>
                  Ração
                  <select
                    value={racaoSelecionada}
                    onChange={(e) => setRacaoSelecionada(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {racoesDisponiveis.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome} ({r.quantidadePacotes} pacotes - {r.quantidade} {r.unidade})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantidade de pacotes
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="Ex: 2"
                    value={pacotesParaEnviar}
                    onChange={(e) => setPacotesParaEnviar(e.target.value)}
                  />
                </label>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowPegarRacao(false)} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Enviando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : caixas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧬</div>
          <p>Nenhum item do bioterio cadastrado. Clique em "Novo Item" para começar.</p>
        </div>
      ) : (
        <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Caixa (ID)</th>
              <th>Grupo de Fêmeas</th>
              <th>Grupo de Machos</th>
              <th>Crias</th>
              <th>Data de Nascimento</th>
              <th>Data de Desmame</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {caixas.map((caixa) => (
              <tr key={caixa.id}>
                <td>#{caixa.id}</td>
                <td>{textoOuTraco(caixa.grupoFemeas)}</td>
                <td>{textoOuTraco(caixa.machosRotativos)}</td>
                <td>{textoOuTraco(caixa.crias)}</td>
                <td>{textoOuTraco(caixa.dataNascimento)}</td>
                <td>{textoOuTraco(caixa.dataDesmame)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={() => openEdit(caixa)} disabled={saving}>
                      Editar
                    </button>
                    <button className="btn-secondary" onClick={() => handleDelete(caixa)} disabled={saving}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {showModal && editingCaixa && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Caixa #{editingCaixa.id}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Fechar modal">
                ✕
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form className="modal-form" onSubmit={handleSaveEdit}>
              <label>
                Grupo de Fêmeas
                <input
                  value={form.grupoFemeas}
                  onChange={(e) => setForm((prev) => ({ ...prev, grupoFemeas: e.target.value }))}
                />
              </label>

              <label>
                Crias
                <textarea
                  rows={3}
                  value={form.crias}
                  onChange={(e) => setForm((prev) => ({ ...prev, crias: e.target.value }))}
                />
              </label>

              <label>
                Grupo de Machos
                <input
                  value={form.machosRotativos}
                  onChange={(e) => setForm((prev) => ({ ...prev, machosRotativos: e.target.value }))}
                />
              </label>

              <label>
                Data de Nascimento
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((prev) => ({ ...prev, dataNascimento: e.target.value }))}
                />
              </label>

              <label>
                Data de Desmame
                <input
                  type="date"
                  value={form.dataDesmame}
                  onChange={(e) => setForm((prev) => ({ ...prev, dataDesmame: e.target.value }))}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
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