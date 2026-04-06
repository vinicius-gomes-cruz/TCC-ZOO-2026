import { useEffect, useState } from 'react'
import { createAnimal, deleteAnimal, getAnimalsByHabitat, updateAnimal } from '../api'
import type { Habitat } from './HabitatPage'

interface Animal {
  id?: number
  nomePopular: string
  nomeCientifico: string
  especie: string
  numeroMicrochipOuAnilha: string
  localizacaoMicrochip: string
  apelido: string
  observacaoSaude: string
  tratamentosFeitos: string
  alimentacao: string
}

interface HabitatAnimalsPageProps {
  habitat: Habitat
  onBack: () => void
}

const emptyAnimal: Animal = {
  nomePopular: '',
  nomeCientifico: '',
  especie: '',
  numeroMicrochipOuAnilha: '',
  localizacaoMicrochip: '',
  apelido: '',
  observacaoSaude: '',
  tratamentosFeitos: '',
  alimentacao: '',
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
  const [editingAnimalId, setEditingAnimalId] = useState<number | null>(null)
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
      const payload = {
        nomePopular: form.nomePopular,
        nomeCientifico: form.nomeCientifico,
        especie: form.especie,
        numeroMicrochipOuAnilha: form.numeroMicrochipOuAnilha,
        localizacaoMicrochip: form.localizacaoMicrochip,
        apelido: form.apelido,
        observacaoSaude: form.observacaoSaude,
        tratamentosFeitos: form.tratamentosFeitos,
        alimentacao: form.alimentacao,
        habitatId: habitat.id,
      }

      if (editingAnimalId) {
        await updateAnimal(editingAnimalId, payload)
      } else {
        await createAnimal(payload)
      }
      setShowAnimalModal(false)
      setForm(emptyAnimal)
      setEditingAnimalId(null)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const openCreateAnimal = () => {
    setEditingAnimalId(null)
    setForm(emptyAnimal)
    setShowAnimalModal(true)
  }

  const openEditAnimal = (animal: Animal) => {
    setEditingAnimalId(animal.id ?? null)
    setForm({
      nomePopular: animal.nomePopular ?? '',
      nomeCientifico: animal.nomeCientifico ?? '',
      especie: animal.especie ?? '',
      numeroMicrochipOuAnilha: animal.numeroMicrochipOuAnilha ?? '',
      localizacaoMicrochip: animal.localizacaoMicrochip ?? '',
      apelido: animal.apelido ?? '',
      observacaoSaude: animal.observacaoSaude ?? '',
      tratamentosFeitos: animal.tratamentosFeitos ?? '',
      alimentacao: animal.alimentacao ?? '',
    })
    setShowAnimalModal(true)
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
          <button className="btn-primary" onClick={openCreateAnimal}>
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
                      <span className="animal-chip-nome">{animal.apelido || animal.nomePopular || 'Sem nome'}</span>
                      <span className="animal-chip-especie">
                        {animal.nomeCientifico ? `${animal.especie} • ${animal.nomeCientifico}` : animal.especie}
                      </span>
                      <div className="animal-chip-meta">
                        {animal.numeroMicrochipOuAnilha && (
                          <span>Microchip/Anilha: {animal.numeroMicrochipOuAnilha}</span>
                        )}
                        {animal.localizacaoMicrochip && (
                          <span>Localização: {animal.localizacaoMicrochip}</span>
                        )}
                        {animal.alimentacao && <span>Alimentação: {animal.alimentacao}</span>}
                        {animal.observacaoSaude && <span>Saúde: {animal.observacaoSaude}</span>}
                        {animal.tratamentosFeitos && <span>Tratamentos: {animal.tratamentosFeitos}</span>}
                      </div>
                    </div>
                    <div className="animal-chip-actions">
                      <button
                        className="animal-chip-edit"
                        onClick={() => openEditAnimal(animal)}
                        title="Editar animal"
                      >
                        ✏️
                      </button>
                      <button
                        className="animal-chip-remove"
                        onClick={() => handleDeleteAnimal(animal.id)}
                        title="Remover animal"
                      >
                        ×
                      </button>
                    </div>
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
              <h2>{editingAnimalId ? 'Editar Animal' : 'Novo Animal'}</h2>
              <button className="modal-close" onClick={() => setShowAnimalModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Nome popular <span className="required">*</span>
                <input
                  required
                  value={form.nomePopular}
                  onChange={(e) => setForm((prev) => ({ ...prev, nomePopular: e.target.value }))}
                />
              </label>

              <label>
                Nome científico
                <input
                  value={form.nomeCientifico}
                  onChange={(e) => setForm((prev) => ({ ...prev, nomeCientifico: e.target.value }))}
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
                  Nº microchip/anilha
                  <input
                    value={form.numeroMicrochipOuAnilha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        numeroMicrochipOuAnilha: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Localização do microchip
                  <input
                    value={form.localizacaoMicrochip}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        localizacaoMicrochip: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Apelido
                <input
                  value={form.apelido}
                  onChange={(e) => setForm((prev) => ({ ...prev, apelido: e.target.value }))}
                />
              </label>

              <label>
                Observação de saúde
                <textarea
                  rows={2}
                  value={form.observacaoSaude}
                  onChange={(e) => setForm((prev) => ({ ...prev, observacaoSaude: e.target.value }))}
                />
              </label>

              <label>
                Tratamentos feitos
                <textarea
                  rows={2}
                  value={form.tratamentosFeitos}
                  onChange={(e) => setForm((prev) => ({ ...prev, tratamentosFeitos: e.target.value }))}
                />
              </label>

              <label>
                Alimentação
                <textarea
                  rows={2}
                  value={form.alimentacao}
                  onChange={(e) => setForm((prev) => ({ ...prev, alimentacao: e.target.value }))}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAnimalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingAnimalId ? 'Salvar Alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
