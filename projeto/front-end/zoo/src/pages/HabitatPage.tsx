import { useEffect, useState } from 'react'
import { getHabitats, createHabitat, updateHabitat, deleteHabitat } from '../api'

interface Habitat {
  id?: number
  nome: string
  descricao: string
  animais: string[]
  requerimentos: string[]
}

const emptyHabitat: Habitat = { nome: '', descricao: '', animais: [], requerimentos: [] }

export default function HabitatPage() {
  const [habitats, setHabitats] = useState<Habitat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Habitat | null>(null)
  const [form, setForm] = useState<Habitat>(emptyHabitat)
  const [animalInput, setAnimalInput] = useState('')
  const [reqInput, setReqInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getHabitats()
      .then(setHabitats)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyHabitat)
    setAnimalInput('')
    setReqInput('')
    setShowModal(true)
  }

  const openEdit = (h: Habitat) => {
    setEditing(h)
    setForm({ ...h, animais: [...(h.animais ?? [])], requerimentos: [...(h.requerimentos ?? [])] })
    setAnimalInput('')
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

  const addAnimal = () => {
    if (!animalInput.trim()) return
    setForm((f) => ({ ...f, animais: [...f.animais, animalInput.trim()] }))
    setAnimalInput('')
  }

  const removeAnimal = (i: number) =>
    setForm((f) => ({ ...f, animais: f.animais.filter((_, idx) => idx !== i) }))

  const addReq = () => {
    if (!reqInput.trim()) return
    setForm((f) => ({ ...f, requerimentos: [...f.requerimentos, reqInput.trim()] }))
    setReqInput('')
  }

  const removeReq = (i: number) =>
    setForm((f) => ({ ...f, requerimentos: f.requerimentos.filter((_, idx) => idx !== i) }))

  return (
    <div className="page">
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
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Animais</th>
                <th>Requerimentos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {habitats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Nenhum habitat cadastrado. Clique em "Novo Habitat" para começar.
                  </td>
                </tr>
              ) : (
                habitats.map((h) => (
                  <tr key={h.id}>
                    <td className="td-id">{h.id}</td>
                    <td className="td-nome">
                      <div className="habitat-icon">🌿</div>
                      <strong>{h.nome}</strong>
                    </td>
                    <td className="td-desc">{h.descricao || <span className="no-data">—</span>}</td>
                    <td>
                      <div className="tag-list">
                        {(h.animais ?? []).length === 0 ? (
                          <span className="no-data">Nenhum</span>
                        ) : (
                          (h.animais ?? []).map((a, i) => (
                            <span key={i} className="tag tag-green">
                              {a}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="tag-list">
                        {(h.requerimentos ?? []).length === 0 ? (
                          <span className="no-data">Nenhum</span>
                        ) : (
                          (h.requerimentos ?? []).map((r, i) => (
                            <span key={i} className="tag tag-blue">
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => openEdit(h)}>
                          ✏️ Editar
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(h.id)}>
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar Habitat' : 'Novo Habitat'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
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

              <label>Animais</label>
              <div className="tag-input-row">
                <input
                  value={animalInput}
                  onChange={(e) => setAnimalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAnimal()
                    }
                  }}
                  placeholder="Nome do animal..."
                />
                <button type="button" className="btn-add" onClick={addAnimal}>
                  Adicionar
                </button>
              </div>
              <div className="tag-list">
                {form.animais.map((a, i) => (
                  <span key={i} className="tag tag-green tag-removable">
                    {a}
                    <button type="button" onClick={() => removeAnimal(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <label>Requerimentos</label>
              <div className="tag-input-row">
                <input
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addReq()
                    }
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
                    <button type="button" onClick={() => removeReq(i)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
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
