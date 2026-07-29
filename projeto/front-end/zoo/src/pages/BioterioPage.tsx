import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createCaixa, getCaixas, updateCaixa, type CaixaRequestPayload } from '../api'

type Caixa = {
  id: number
  numeroCaixa: number
  grupoFemeas: string | null
  idadeFemeas: string | null
  crias: string | null
  machosRotativos: string | null
  observacoes: string | null
}

const textoOuTraco = (valor?: string | null) => {
  const texto = valor?.trim()
  return texto && texto.length > 0 ? texto : '—'
}

export default function BioterioPage() {
  const [caixas, setCaixas] = useState<Caixa[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCaixa, setEditingCaixa] = useState<Caixa | null>(null)
  const [form, setForm] = useState({
    grupoFemeas: '',
    idadeFemeas: '',
    crias: '',
    machosRotativos: '',
    observacoes: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)

    getCaixas()
      .then((list) => setCaixas(Array.isArray(list) ? (list as Caixa[]) : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    setError(null)

    try {
      setSaving(true)
      await createCaixa({})
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
      idadeFemeas: caixa.idadeFemeas ?? '',
      crias: caixa.crias ?? '',
      machosRotativos: caixa.machosRotativos ?? '',
      observacoes: caixa.observacoes ?? '',
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
      idadeFemeas: form.idadeFemeas.trim() || null,
      crias: form.crias.trim() || null,
      machosRotativos: form.machosRotativos.trim() || null,
      observacoes: form.observacoes.trim() || null,
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bioterio</h1>
          <p className="page-subtitle">Gerencie as caixas do biotério</p>
        </div>
        <button className="btn-primary" onClick={handleCreate} disabled={saving}>
          {saving ? 'Criando...' : '+ Novo Item'}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : caixas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧬</div>
          <p>Nenhum item do bioterio cadastrado. Clique em "Novo Item" para começar.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Caixa (ID)</th>
              <th>Grupo de Fêmeas</th>
              <th>Idade das Fêmeas</th>
              <th>Crias</th>
              <th>Machos Rotativos</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {caixas.map((caixa) => (
              <tr key={caixa.id}>
                <td>#{caixa.id}</td>
                <td>{textoOuTraco(caixa.grupoFemeas)}</td>
                <td>{textoOuTraco(caixa.idadeFemeas)}</td>
                <td>{textoOuTraco(caixa.crias)}</td>
                <td>{textoOuTraco(caixa.machosRotativos)}</td>
                <td>{textoOuTraco(caixa.observacoes)}</td>
                <td>
                  <button className="btn-secondary" onClick={() => openEdit(caixa)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

            <form className="modal-form" onSubmit={handleSaveEdit}>
              <label>
                Grupo de Fêmeas
                <input
                  value={form.grupoFemeas}
                  onChange={(e) => setForm((prev) => ({ ...prev, grupoFemeas: e.target.value }))}
                />
              </label>

              <label>
                Idade das Fêmeas
                <input
                  value={form.idadeFemeas}
                  onChange={(e) => setForm((prev) => ({ ...prev, idadeFemeas: e.target.value }))}
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
                Machos Rotativos
                <input
                  value={form.machosRotativos}
                  onChange={(e) => setForm((prev) => ({ ...prev, machosRotativos: e.target.value }))}
                />
              </label>

              <label>
                Observações
                <textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
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