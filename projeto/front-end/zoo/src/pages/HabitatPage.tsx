import { useEffect, useState } from 'react'
import {
  getHabitats,
  createHabitat,
  updateHabitat,
  deleteHabitat,
  getAnimalsByHabitat,
  createAnimal,
  deleteAnimal,
} from '../api'

interface Habitat {
  id?: number
  nome: string
  descricao: string
  animais: string[]
  requerimentos: string[]
}

interface Animal {
  id?: number
  nome: string
  especie: string
  idade: number | ''
  peso: number | ''
  descricao: string
}

const emptyHabitat: Habitat = { nome: '', descricao: '', animais: [], requerimentos: [] }
const emptyAnimal: Animal = { nome: '', especie: '', idade: '', peso: '', descricao: '' }

const speciesPalette = [
  { background: '#e8f5e9', color: '#1b5e20' },
  { background: '#e3f2fd', color: '#0d47a1' },
  { background: '#fff8e1', color: '#e65100' },
  { background: '#f3e5f5', color: '#4a148c' },
  { background: '#fce4ec', color: '#880e4f' },
]

function getSpeciesVisual(species: string) {
  const normalized = species?.trim() || 'Animal'
  const hash = Array.from(normalized).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const palette = speciesPalette[hash % speciesPalette.length]
  const words = normalized.split(/\s+/)
  const label =
    words.length > 1
      ? `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
      : (words[0]?.slice(0, 2) ?? 'AN').toUpperCase()

  return {
    label,
    background: palette.background,
    color: palette.color,
  }
}

export default function HabitatPage() {
  const [habitats, setHabitats] = useState<Habitat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Habitat modal ────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Habitat | null>(null)
  const [form, setForm] = useState<Habitat>(emptyHabitat)
  const [reqInput, setReqInput] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Animais por habitat ──────────────────────────────────────
  const [animalsByHabitat, setAnimalsByHabitat] = useState<Record<number, Animal[]>>({})

  // ── Modal adicionar animal ───────────────────────────────────
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [animalHabitatId, setAnimalHabitatId] = useState<number | null>(null)
  const [animalForm, setAnimalForm] = useState<Animal>(emptyAnimal)
  const [savingAnimal, setSavingAnimal] = useState(false)

  const loadAnimalsForHabitat = (habitatId: number) => {
    getAnimalsByHabitat(habitatId)
      .then((animals: Animal[]) =>
        setAnimalsByHabitat((prev) => ({ ...prev, [habitatId]: animals }))
      )
      .catch(() => {})
  }

  const load = () => {
    setLoading(true)
    setError(null)
    getHabitats()
      .then((list: Habitat[]) => {
        setHabitats(list)
        list.forEach((h) => { if (h.id) loadAnimalsForHabitat(h.id) })
      })
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

  const openEdit = (h: Habitat) => {
    setEditing(h)
    setForm({ ...h, requerimentos: [...(h.requerimentos ?? [])] })
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
    setForm((f) => ({ ...f, requerimentos: [...f.requerimentos, reqInput.trim()] }))
    setReqInput('')
  }

  const removeReq = (i: number) =>
    setForm((f) => ({ ...f, requerimentos: f.requerimentos.filter((_, idx) => idx !== i) }))

  // ── Animal handlers ──────────────────────────────────────────
  const openAddAnimal = (habitatId: number) => {
    setAnimalHabitatId(habitatId)
    setAnimalForm(emptyAnimal)
    setShowAnimalModal(true)
  }

  const handleAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animalHabitatId) return
    setSavingAnimal(true)
    try {
      await createAnimal({
        nome: animalForm.nome,
        especie: animalForm.especie,
        idade: animalForm.idade === '' ? null : Number(animalForm.idade),
        peso: animalForm.peso === '' ? null : Number(animalForm.peso),
        descricao: animalForm.descricao,
        habitatId: animalHabitatId,
      })
      setShowAnimalModal(false)
      loadAnimalsForHabitat(animalHabitatId)
    } catch (e) {
      setError(String(e))
    } finally {
      setSavingAnimal(false)
    }
  }

  const handleDeleteAnimal = async (animalId: number, habitatId: number) => {
    if (!window.confirm('Deseja remover este animal?')) return
    try {
      await deleteAnimal(animalId)
      loadAnimalsForHabitat(habitatId)
    } catch (e) {
      setError(String(e))
    }
  }

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
      ) : habitats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌿</div>
          <p>Nenhum habitat cadastrado. Clique em "Novo Habitat" para começar.</p>
        </div>
      ) : (
        <div className="habitat-grid">
          {habitats.map((h) => {
            const animals: Animal[] = h.id ? (animalsByHabitat[h.id] ?? []) : []
            return (
              <div key={h.id} className="habitat-card">
                <div className="habitat-card-header">
                  <div className="habitat-card-icon">🌿</div>
                  <div className="habitat-card-title">
                    <span className="habitat-card-id">#{h.id}</span>
                    <h3>{h.nome}</h3>
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

                <div className="habitat-card-section">
                  <div className="habitat-card-section-header">
                    <span className="habitat-card-label">🐾 Animais ({animals.length})</span>
                    <button
                      className="btn-add-animal"
                      onClick={() => h.id && openAddAnimal(h.id)}
                      title="Adicionar animal"
                    >
                      + Animal
                    </button>
                  </div>
                  <div className="animal-list">
                    {animals.length === 0 ? (
                      <span className="no-data">Nenhum animal cadastrado</span>
                    ) : (
                      animals.map((a) => {
                        const speciesVisual = getSpeciesVisual(a.especie)
                        return (
                          <div key={a.id} className="animal-chip">
                            <span
                              className="animal-species-badge"
                              style={{
                                '--species-bg': speciesVisual.background,
                                '--species-fg': speciesVisual.color,
                              } as React.CSSProperties}
                              title={`Espécie: ${a.especie}`}
                              aria-label={`Espécie: ${a.especie}`}
                            >
                              {speciesVisual.label}
                            </span>
                            <div className="animal-chip-info">
                              <span className="animal-chip-nome">{a.nome}</span>
                              <span className="animal-chip-especie">{a.especie}</span>
                            </div>
                            <button
                              className="animal-chip-remove"
                              onClick={() => a.id && h.id && handleDeleteAnimal(a.id, h.id)}
                              title="Remover animal"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="habitat-card-actions">
                  <button className="btn-edit" onClick={() => openEdit(h)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(h.id)}>
                    🗑️ Excluir
                  </button>
                </div>
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

      {/* ── Modal Adicionar Animal ─────────────────────────────── */}
      {showAnimalModal && (
        <div className="modal-overlay" onClick={() => setShowAnimalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Animal</h2>
              <button className="modal-close" onClick={() => setShowAnimalModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAnimalSubmit} className="modal-form">
              <label>
                Nome <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Simba"
                  value={animalForm.nome}
                  onChange={(e) => setAnimalForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </label>

              <label>
                Espécie <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Panthera leo"
                  value={animalForm.especie}
                  onChange={(e) => setAnimalForm((f) => ({ ...f, especie: e.target.value }))}
                />
              </label>

              <div className="modal-form-row">
                <label>
                  Idade (anos)
                  <input
                    type="number"
                    min={0}
                    placeholder="Ex: 5"
                    value={animalForm.idade}
                    onChange={(e) =>
                      setAnimalForm((f) => ({ ...f, idade: e.target.value === '' ? '' : Number(e.target.value) }))
                    }
                  />
                </label>
                <label>
                  Peso (kg)
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    placeholder="Ex: 180.5"
                    value={animalForm.peso}
                    onChange={(e) =>
                      setAnimalForm((f) => ({ ...f, peso: e.target.value === '' ? '' : Number(e.target.value) }))
                    }
                  />
                </label>
              </div>

              <label>
                Descrição
                <textarea
                  placeholder="Observações sobre o animal..."
                  value={animalForm.descricao}
                  onChange={(e) => setAnimalForm((f) => ({ ...f, descricao: e.target.value }))}
                  rows={2}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAnimalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={savingAnimal}>
                  {savingAnimal ? 'Salvando...' : 'Adicionar Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}