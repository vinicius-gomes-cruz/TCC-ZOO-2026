import { useEffect, useState } from 'react'
import { createAnimal, deleteAnimal, getAnimalsByHabitat } from '../api'
import type { Habitat } from './HabitatPage'

interface Animal {
  id?: number
  nome: string
  especie: string
  idade: number | ''
  peso: number | ''
  descricao: string
}

interface HabitatAnimalsPageProps {
  habitat: Habitat
  onBack: () => void
}

const emptyAnimal: Animal = {
  nome: '',
  especie: '',
  idade: '',
  peso: '',
  descricao: '',
}

const speciesPalette = [
  { background: '#e8f5e9', color: '#1b5e20' },
  { background: '#e3f2fd', color: '#0d47a1' },
  { background: '#fff8e1', color: '#e65100' },
  { background: '#f3e5f5', color: '#4a148c' },
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

  return { label, palette }
}

export default function HabitatAnimalsPage({ habitat, onBack }: HabitatAnimalsPageProps) {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [form, setForm] = useState<Animal>(emptyAnimal)
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!habitat.id) return
    setLoading(true)
    setError(null)
    getAnimalsByHabitat(habitat.id)
      .then((list: Animal[]) => setAnimals(list))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [habitat.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitat.id) return

    setSaving(true)
    try {
      await createAnimal({
        nome: form.nome,
        especie: form.especie,
        idade: form.idade === '' ? null : Number(form.idade),
        peso: form.peso === '' ? null : Number(form.peso),
        descricao: form.descricao,
        habitatId: habitat.id,
      })
      setShowAnimalModal(false)
      setForm(emptyAnimal)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnimal = async (animalId?: number) => {
    if (!animalId || !window.confirm('Deseja remover este animal?')) return
    try {
      await deleteAnimal(animalId)
      load()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Habitat: {habitat.nome}</h1>
          <p className="page-subtitle">Gerencie os animais deste habitat</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={onBack}>
            ← Voltar
          </button>
          <button className="btn-primary" onClick={() => setShowAnimalModal(true)}>
            + Novo Animal
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Carregando animais...</div>
      ) : (
        <div className="card animals-panel">
          {animals.length === 0 ? (
            <div className="empty">Nenhum animal cadastrado neste habitat.</div>
          ) : (
            <div className="animal-list">
              {animals.map((animal) => {
                const visual = getSpeciesVisual(animal.especie)
                return (
                  <div key={animal.id} className="animal-chip">
                    <span
                      className="animal-species-badge"
                      style={{ background: visual.palette.background, color: visual.palette.color }}
                      title={`Espécie: ${animal.especie}`}
                    >
                      {visual.label}
                    </span>
                    <div className="animal-chip-info">
                      <span className="animal-chip-nome">{animal.nome}</span>
                      <span className="animal-chip-especie">{animal.especie}</span>
                    </div>
                    <button
                      className="animal-chip-remove"
                      onClick={() => handleDeleteAnimal(animal.id)}
                      title="Remover animal"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showAnimalModal && (
        <div className="modal-overlay" onClick={() => setShowAnimalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Animal</h2>
              <button className="modal-close" onClick={() => setShowAnimalModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Nome <span className="required">*</span>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                />
              </label>

              <label>
                Espécie <span className="required">*</span>
                <input
                  required
                  value={form.especie}
                  onChange={(e) => setForm((prev) => ({ ...prev, especie: e.target.value }))}
                />
              </label>

              <div className="modal-form-row">
                <label>
                  Idade (anos)
                  <input
                    type="number"
                    min={0}
                    value={form.idade}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        idade: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Peso (kg)
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.peso}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        peso: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Descrição
                <textarea
                  rows={2}
                  value={form.descricao}
                  onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAnimalModal(false)}>
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
