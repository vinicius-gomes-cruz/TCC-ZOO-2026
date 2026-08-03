import { useEffect, useMemo, useState } from 'react'
import { criarItemEstoque, deletarItemEstoque, listarItensEstoque } from '../api'

type TipoEstoque = 'ALIMENTO' | 'MATERIAL'

interface ItemEstoque {
  id: number
  tipo: TipoEstoque
  nome: string
  quantidade: number
  unidade: string
  dataEntrada: string
  observacao?: string | null
}

const tabOptions: Array<{ value: TipoEstoque; label: string }> = [
  { value: 'ALIMENTO', label: 'Alimentos' },
  { value: 'MATERIAL', label: 'Materiais' },
]

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState<TipoEstoque>('ALIMENTO')
  const [showForm, setShowForm] = useState(false)
  const [itens, setItens] = useState<ItemEstoque[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '',
    quantidade: '',
    unidade: '',
    observacao: '',
  })

  const unidadePadrao = activeTab === 'ALIMENTO' ? 'kg' : 'un'

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listarItensEstoque(activeTab)
      setItens(Array.isArray(data) ? (data as ItemEstoque[]) : [])
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
      observacao: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantidade = Number(form.quantidade)
    if (!form.nome.trim()) {
      setError('Informe o nome do item')
      return
    }
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setError('Informe uma quantidade válida')
      return
    }

    try {
      setSaving(true)
      setError(null)

      await criarItemEstoque({
        tipo: activeTab,
        nome: form.nome.trim(),
        quantidade,
        unidade: activeTab === 'ALIMENTO' ? 'kg' : (form.unidade.trim() || unidadePadrao),
        observacao: form.observacao.trim() || null,
      })

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

  const titulo = useMemo(() => {
    return activeTab === 'ALIMENTO' ? 'Entradas de alimentos' : 'Entradas de materiais'
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
                <th>Data</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Observação</th>
                <th className="col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.dataEntrada).toLocaleDateString('pt-BR')}</td>
                  <td className="font-weight-bold">{item.nome}</td>
                  <td>
                    {item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unidade}
                  </td>
                  <td>{item.observacao?.trim() ? item.observacao : '—'}</td>
                  <td className="col-acoes">
                    <button className="btn-secondary" onClick={() => handleDelete(item.id)} disabled={saving}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay modal-overlay-estoque" onClick={() => setShowForm(false)}>
          <div className="modal modal-estoque" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo registro ({activeTab === 'ALIMENTO' ? 'alimento' : 'material'})</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form estoque-form-grid">
              <label>
                Nome do item <span className="required">*</span>
                <input
                  required
                  placeholder={activeTab === 'ALIMENTO' ? 'Ex: Ração para primatas' : 'Ex: Luva descartável'}
                  value={form.nome}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                />
              </label>

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

              <label>
                Observação
                <input
                  placeholder="Opcional"
                  value={form.observacao}
                  onChange={(e) => setForm((prev) => ({ ...prev, observacao: e.target.value }))}
                />
              </label>

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