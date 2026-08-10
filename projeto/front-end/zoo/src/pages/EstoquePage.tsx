import { useEffect, useMemo, useState } from 'react'
import { adicionarPacotesEstoque, criarItemEstoque, deletarItemEstoque, finalizarRacaoNoBioterio, listarItensEstoque, listarRacoesNoBioterio, type ItemEstoqueRacao } from '../api'

type TipoEstoque = 'ALIMENTO' | 'MATERIAL' | 'RACAO'

interface ItemEstoque {
  id: number
  tipo: TipoEstoque
  nome: string
  quantidade: number
  unidade: string
  dataEntrada: string
  noBioterio: boolean
  quantidadePacotes: number | null
  pesoPorPacote: number | null
}

const tabOptions: Array<{ value: TipoEstoque; label: string }> = [
  { value: 'ALIMENTO', label: 'Alimentos' },
  { value: 'RACAO', label: 'Ração (Biotério)' },
  { value: 'MATERIAL', label: 'Materiais' },
]

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState<TipoEstoque>('ALIMENTO')
  const [showForm, setShowForm] = useState(false)
  const [itens, setItens] = useState<ItemEstoque[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [racoesNoBioterio, setRacoesNoBioterio] = useState<ItemEstoqueRacao[]>([])
  const [form, setForm] = useState({
    nome: '',
    quantidade: '',
    unidade: '',
    pesoPorPacote: '',
    quantidadePacotes: '',
  })

  const unidadePadrao = (activeTab === 'ALIMENTO' || activeTab === 'RACAO') ? 'kg' : 'un'

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listarItensEstoque(activeTab)
      setItens(Array.isArray(data) ? (data as ItemEstoque[]) : [])
      if (activeTab === 'RACAO') {
        const bioterio = await listarRacoesNoBioterio()
        setRacoesNoBioterio(Array.isArray(bioterio) ? bioterio : [])
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [activeTab])

  const limparFormulario = () => {
    setForm({
      nome: '',
      quantidade: '',
      unidade: '',
      pesoPorPacote: '',
      quantidadePacotes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nome.trim()) {
      setError('Informe o nome do item')
      return
    }

    if (activeTab === 'RACAO') {
      const peso = Number(form.pesoPorPacote)
      const pacotes = Number(form.quantidadePacotes)
      if (!Number.isFinite(peso) || peso <= 0) {
        setError('Informe o peso por pacote')
        return
      }
      if (!Number.isFinite(pacotes) || pacotes <= 0 || !Number.isInteger(pacotes)) {
        setError('Informe a quantidade de pacotes')
        return
      }
    } else {
      const quantidade = Number(form.quantidade)
      if (!Number.isFinite(quantidade) || quantidade <= 0) {
        setError('Informe uma quantidade válida')
        return
      }
    }

    try {
      setSaving(true)
      setError(null)

      const payload: any = {
        tipo: activeTab,
        nome: form.nome.trim(),
        unidade: (activeTab === 'ALIMENTO' || activeTab === 'RACAO') ? 'kg' : (form.unidade.trim() || unidadePadrao),
      }

      if (activeTab === 'RACAO') {
        payload.pesoPorPacote = Number(form.pesoPorPacote)
        payload.quantidadePacotes = Number(form.quantidadePacotes)
        payload.quantidade = payload.pesoPorPacote * payload.quantidadePacotes
      } else {
        payload.quantidade = Number(form.quantidade)
      }

      await criarItemEstoque(payload)

      limparFormulario()
      setShowForm(false)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja excluir este item do estoque?')) return

    try {
      setSaving(true)
      setError(null)
      await deletarItemEstoque(id)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleAdicionarPacotes = async (id: number) => {
    const input = window.prompt('Quantos pacotes deseja adicionar?')
    if (!input) return
    const pacotes = Number(input)
    if (!Number.isInteger(pacotes) || pacotes <= 0) {
      setError('Informe um número inteiro de pacotes válido')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await adicionarPacotesEstoque(id, pacotes)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizarNoBioterio = async (id: number) => {
    if (!window.confirm('Confirma que esta ração acabou? Ela será removida do estoque.')) return
    try {
      setSaving(true)
      setError(null)
      await finalizarRacaoNoBioterio(id)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const titulo = useMemo(() => {
    if (activeTab === 'ALIMENTO') return 'Entradas de alimentos'
    if (activeTab === 'RACAO') return 'Ração do biotério'
    return 'Entradas de materiais'
  }, [activeTab])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">Registre tudo que chega no estoque em uma lista corrida</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Novo registro
        </button>
      </div>

      <div className="estoque-tabs">
        {tabOptions.map((tab) => (
          <button
            key={tab.value}
            className={`estoque-tab-btn ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <h2 className="section-title">{titulo}</h2>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : itens.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>Nenhum item registrado nesta aba ainda.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {activeTab !== 'RACAO' && <th>Data</th>}
                <th>Item</th>
                {activeTab === 'RACAO' && <th>Peso/Pacote</th>}
                {activeTab === 'RACAO' && <th>Pacotes</th>}
                <th>Peso Total</th>
                <th className="col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  {activeTab !== 'RACAO' && <td>{new Date(item.dataEntrada).toLocaleDateString('pt-BR')}</td>}
                  <td className="font-weight-bold">{item.nome}</td>
                  {activeTab === 'RACAO' && <td>{item.pesoPorPacote ? `${item.pesoPorPacote} kg` : '—'}</td>}
                  {activeTab === 'RACAO' && <td>{item.quantidadePacotes ?? '—'}</td>}
                  <td>
                    {item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unidade}
                  </td>
                  <td className="col-acoes">
                    <div style={{ display: 'flex', gap: 4 }}>
                      {activeTab === 'RACAO' && (
                        <button className="btn-primary" onClick={() => handleAdicionarPacotes(item.id)} disabled={saving}>
                          + Pacotes
                        </button>
                      )}
                      <button className="btn-secondary" onClick={() => handleDelete(item.id)} disabled={saving}>
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

      {activeTab === 'RACAO' && racoesNoBioterio.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">Pacotes no biotério</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ração</th>
                  <th>Pacotes</th>
                  <th>Peso Total</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {racoesNoBioterio.map((r) => (
                  <tr key={r.id}>
                    <td className="font-weight-bold">{r.nome}</td>
                    <td>{r.quantidadePacotes ?? '—'}</td>
                    <td>{r.quantidade} {r.unidade}</td>
                    <td className="col-acoes">
                      <button className="btn-secondary" onClick={() => handleFinalizarNoBioterio(r.id)} disabled={saving}>
                        Acabou
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay modal-overlay-estoque" onClick={() => setShowForm(false)}>
          <div className="modal modal-estoque" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo registro ({activeTab === 'ALIMENTO' ? 'alimento' : activeTab === 'RACAO' ? 'ração' : 'material'})</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form estoque-form-grid">
              <label>
                Nome do item <span className="required">*</span>
                <input
                  required
                  placeholder={activeTab === 'ALIMENTO' ? 'Ex: Milho triturado' : activeTab === 'RACAO' ? 'Ex: Ração para camundongos' : 'Ex: Luva descartável'}
                  value={form.nome}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                />
              </label>

              {activeTab === 'RACAO' ? (
                <>
                  <label>
                    Peso por pacote (kg) <span className="required">*</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 5"
                      value={form.pesoPorPacote}
                      onChange={(e) => setForm((prev) => ({ ...prev, pesoPorPacote: e.target.value }))}
                    />
                  </label>
                  <label>
                    Quantidade de pacotes <span className="required">*</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ex: 3"
                      value={form.quantidadePacotes}
                      onChange={(e) => setForm((prev) => ({ ...prev, quantidadePacotes: e.target.value }))}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Quantidade {activeTab === 'ALIMENTO' ? '(kg)' : ''} <span className="required">*</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={activeTab === 'ALIMENTO' ? 'Ex: 25' : 'Ex: 12'}
                      value={form.quantidade}
                      onChange={(e) => setForm((prev) => ({ ...prev, quantidade: e.target.value }))}
                    />
                  </label>
                  {activeTab === 'MATERIAL' && (
                    <label>
                      Unidade
                      <input
                        placeholder="Ex: un, caixa, pacote"
                        value={form.unidade}
                        onChange={(e) => setForm((prev) => ({ ...prev, unidade: e.target.value }))}
                      />
                    </label>
                  )}
                </>
              )}

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : '+ Adicionar na lista'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}