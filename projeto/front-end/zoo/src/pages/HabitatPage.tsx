import { useEffect, useState } from 'react'
import { createHabitat, deleteHabitat, getHabitats, updateHabitat } from '../api'

export interface Habitat {
  id?: number
  nome: string
  descricao: string
  animais: string[]
  requerimentos: string[]
}

interface HabitatPageProps {
  onOpenHabitat: (habitat: Habitat) => void
}

const emptyHabitat: Habitat = { nome: '', descricao: '', animais: [], requerimentos: [] }

export default function HabitatPage({ onOpenHabitat }: HabitatPageProps) {
  const [habitats, setHabitats] = useState<Habitat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Habitat | null>(null)
  const [form, setForm] = useState<Habitat>(emptyHabitat)
  const [reqInput, setReqInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getHabitats()
      .then((list: Habitat[]) => setHabitats(list))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyHabitat)
    setReqInput('')
    setShowModal(true)
  }

  const openEdit = (habitat: Habitat) => {
    setEditing(habitat)
    setForm({ ...habitat, requerimentos: [...(habitat.requerimentos ?? [])] })
    setReqInput('')
    setShowModal(true)
  }

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Deseja excluir este habitat?')) return
    try {
      await deleteHabitat(id)
      load()
    } catch (e) {
      setError(String(e))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing?.id) {
        await updateHabitat(editing.id, form)
      } else {
        await createHabitat(form)
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const addReq = () => {
    if (!reqInput.trim()) return
    setForm((prev) => ({ ...prev, requerimentos: [...prev.requerimentos, reqInput.trim()] }))
    setReqInput('')
  }

  const removeReq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      requerimentos: prev.requerimentos.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <div className="page" onClick={() => setOpenMenuId(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habitats</h1>
          <p className="page-subtitle">Gerencie os habitats do zoológico</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Novo Habitat
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : habitats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌿</div>
          <p>Nenhum habitat cadastrado. Clique em "Novo Habitat" para começar.</p>
        </div>
      ) : (
        <div className="habitat-grid">
          {habitats.map((h) => {
            return (
              <div
                key={h.id}
                className="habitat-card habitat-card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenHabitat(h)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenHabitat(h)
                  }
                }}
              >
                <div className="habitat-card-header">
                  <div className="habitat-card-header-left">
                    <div className="habitat-card-icon">🌿</div>
                    <div className="habitat-card-title">
                      <span className="habitat-card-id">#{h.id}</span>
                      <h3>{h.nome}</h3>
                    </div>
                  </div>
                  <div className="habitat-card-menu">
                    <button
                      className="habitat-card-menu-btn"
                      aria-label="Mais ações"
                      title="Mais ações"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === h.id ? null : (h.id ?? null))
                      }}
                    >
                      ⋯
                    </button>
                    {openMenuId === h.id && (
                      <div
                        className="habitat-card-menu-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="habitat-card-menu-item"
                          onClick={() => {
                            setOpenMenuId(null)
                            openEdit(h)
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="habitat-card-menu-item danger"
                          onClick={() => {
                            setOpenMenuId(null)
                            handleDelete(h.id)
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {h.descricao && (
                  <p className="habitat-card-desc">{h.descricao}</p>
                )}

                {(h.requerimentos ?? []).length > 0 && (
                  <div className="habitat-card-section">
                    <span className="habitat-card-label">📋 Requerimentos</span>
                    <div className="tag-list">
                      {h.requerimentos.map((r, i) => (
                        <span key={i} className="tag tag-blue">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Habitat ──────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar Habitat' : 'Novo Habitat'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Nome <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Savana Africana"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </label>

              <label>
                Descrição
                <textarea
                  placeholder="Descreva o habitat..."
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                />
              </label>

              <label>Requerimentos</label>
              <div className="tag-input-row">
                <input
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addReq() }
                  }}
                  placeholder="Ex: Temperatura 25-30°C..."
                />
                <button type="button" className="btn-add" onClick={addReq}>
                  Adicionar
                </button>
              </div>
              <div className="tag-list">
                {form.requerimentos.map((r, i) => (
                  <span key={i} className="tag tag-blue tag-removable">
                    {r}
                    <button type="button" onClick={() => removeReq(i)}>×</button>
                  </span>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Habitat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}